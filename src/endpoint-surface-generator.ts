import path from "node:path";
import * as ts from "typescript";
import {
	camelize,
	collectRpcMethods,
	createProgram,
	defaultPolicies,
	emitReadExpression,
	emitWriteExpression,
	generateRpcSurfaceCodecModules,
	getTypeFromExportedAlias,
	normalizeType,
	renderRpcCodecModule,
	type TypeNodeShape,
	unwrapPromiseLikeType,
	type CodecPolicies
} from "./codec-generator.js";
import { renderInlinedContractRuntimePrelude } from "./contract-runtime-inline-generator.js";
import { generateHttpRouteManifest } from "./http-route-generator.js";
import { buildSyntheticRpcDeclaration, buildSyntheticRpcRuntime, type HostRpcSurfaceDefinition } from "./synthetic-rpc-surface.js";

export type GenerateEndpointSurfaceOptions = {
	entryFile: string;
	rootType: string;
	outputImportPath: string;
	moduleSpecifier?: string;
	runtimeImportPath?: string;
	rootPath?: string[];
	globalName?: string;
	declarationTypeName?: string;
	methodModuleDir?: string;
	policies?: CodecPolicies;
};

export type GeneratedEndpointSurfaceFile = {
	path: string;
	content: string;
};

export type GeneratedEndpointSurfaceResult = {
	surfaceDefinition: HostRpcSurfaceDefinition;
	declarationText: string;
	contractText: string;
	publicModuleText: string;
	runtimeText: string;
	surfaceDefinitionText: string;
	files: GeneratedEndpointSurfaceFile[];
};

export type GenerateEndpointGlobalDeclarationOptions = {
	entryFile: string;
	rootType: string;
	rootPath?: string[];
	declarationTypeName: string;
	globalName: string;
	policies?: CodecPolicies;
};

export function generateEndpointSurface(options: GenerateEndpointSurfaceOptions): GeneratedEndpointSurfaceResult {
	const policies = defaultPolicies(options.policies);
	const program = createProgram(options.entryFile);
	const checker = program.getTypeChecker();
	const sourceFile = program.getSourceFile(options.entryFile);
	if (!sourceFile) throw new Error(`Could not load source file ${options.entryFile}`);
	const rootType = getTypeFromExportedAlias(sourceFile, checker, options.rootType);
	const rootPath = options.rootPath ?? [camelize(options.rootType)];
	const globalName = options.globalName ?? rootPath[rootPath.length - 1] ?? camelize(options.rootType);
	const outputDir = path.dirname(options.outputImportPath);
	const methodModuleDir = options.methodModuleDir ?? `${globalName}.codecs`;
	const sourceImportPath = options.moduleSpecifier ?? toModuleRelativeImport(options.outputImportPath, options.entryFile).replace(/\.ts$/, ".js");
	const methods = collectRpcMethods(rootType, checker, policies);
	const routeManifest = generateHttpRouteManifest({
		entryFile: options.entryFile,
		rootType: options.rootType,
		rootPath,
		basePath: "/",
		protocolMode: "both",
		policies: options.policies,
	});
	const codecModules = generateRpcSurfaceCodecModules({
		entryFile: options.entryFile,
		rootType: options.rootType,
		outputImportPath: path.join(path.dirname(options.outputImportPath), methodModuleDir, "__codec-anchor__.ts"),
		moduleSpecifier: options.moduleSpecifier,
		runtimeImportPath: options.runtimeImportPath,
		policies: options.policies
	});
	const codecByMethod = new Map(codecModules.map((entry) => [entry.methodName, entry]));
	const files: GeneratedEndpointSurfaceFile[] = [];
	for (const codecModule of codecModules) {
		files.push({
			path: path.join(outputDir, methodModuleDir, `${codecModule.exportBase}.codec.ts`),
			content: codecModule.code,
		});
	}
	files.push({
		path: path.join(outputDir, `${globalName}.codec-registry.ts`),
		content: renderGeneratedCodecRegistryModule({
			globalName,
			methodModuleDir,
			methods,
			codecByMethod
		})
	});
	files.push({
		path: options.outputImportPath,
		content: renderGeneratedSurfaceModule({
			rootType: options.rootType,
			rootPath,
			globalName,
			sourceImportPath,
			contractModulePath: `./${path.basename(options.outputImportPath).replace(/\.surface\.ts$/, ".contract.js")}`,
			methodModuleDir,
			methods,
			codecByMethod
		})
	});
	const surfaceDefinition = buildSurfaceDefinition({
		rootPath,
		globalName,
		declarationTypeName: options.declarationTypeName ?? `__nrpcGenerated${pascalize(globalName)}Api`,
		entryFile: options.entryFile,
		outputImportPath: options.outputImportPath,
		sourceImportPath,
		rootType: options.rootType
	});
	return {
		surfaceDefinition,
		declarationText: buildSyntheticRpcDeclaration(surfaceDefinition),
		contractText: renderGeneratedContractModule({
			rootType: options.rootType,
			rootPath,
			globalName,
			routeManifest,
			checker,
			policies,
			methodModuleDir,
			methods,
			codecByMethod,
		}),
		publicModuleText: renderGeneratedSurfaceModule({
			rootType: options.rootType,
			rootPath,
			globalName,
			sourceImportPath,
			contractModulePath: `./${path.basename(options.outputImportPath).replace(/\.surface\.ts$/, ".contract.js")}`,
			methodModuleDir,
			methods,
			codecByMethod,
		}),
		runtimeText: buildSyntheticRpcRuntime(surfaceDefinition),
		surfaceDefinitionText: renderSurfaceDefinitionModule({
			globalName,
			surfaceDefinition,
			declarationTypeName: options.declarationTypeName ?? `__nrpcGenerated${pascalize(globalName)}Api`,
			sourceImportPath,
		}),
		files
	};
}

type RenderGeneratedContractModuleOptions = {
	rootType: string;
	rootPath: string[];
	globalName: string;
	routeManifest: ReturnType<typeof generateHttpRouteManifest>;
	checker: ts.TypeChecker;
	policies: Required<CodecPolicies>;
	methodModuleDir: string;
	methods: ReturnType<typeof collectRpcMethods>;
	codecByMethod: Map<string, { methodName: string; exportBase: string; code: string }>;
};

function renderGeneratedContractModule(options: RenderGeneratedContractModuleOptions): string {
	const inlineMethods = options.methods
		.map((method) => {
			const codecModule = options.codecByMethod.get(method.methodName);
			if (!codecModule) throw new Error(`Missing codec module for ${method.methodName}`);
			const methodTypeLiteral = renderRpcMethodLiteral(method, options.checker, options.policies);
			const signature = renderRpcMethodImplementationSignature(method.argsShape, method.parameterNames, options.policies);
			return {
				methodName: method.methodName,
				argsTypeReference: methodTypeLiteral.argsTupleType,
				resultTypeReference: methodTypeLiteral.resultType,
				signature,
				parameterNames: method.parameterNames,
				argsShape: method.argsShape,
				resultShape: normalizeType(unwrapPromiseLikeType(method.resultType, options.checker), options.checker, options.policies),
				pathParts: method.path,
			};
		})
		.sort((a, b) => a.methodName.localeCompare(b.methodName));
	return [
		"// AUTO-GENERATED FILE. DO NOT EDIT.",
		renderInlinedContractRuntimePrelude(),
		"",
		`export const ${options.globalName}RpcDefinition = ${renderInlineSurfaceDefinition(inlineMethods, 0)};`,
		"",
		renderInlineSurfaceMetadataAttachment(options.globalName, inlineMethods),
		"",
		`export const ${options.globalName}HttpRouteManifest: HttpRouteManifest = ${JSON.stringify(stripRouteManifestTypeRefs(options.routeManifest), null, 2)};`,
		"",
	].join("\n");
}

function stripRouteManifestTypeRefs(manifest: ReturnType<typeof generateHttpRouteManifest>) {
	return {
		...manifest,
		routes: manifest.routes.map(({ argsTypeReference: _argsTypeReference, resultTypeReference: _resultTypeReference, ...route }) => route),
	};
}

function renderRpcMethodLiteral(
	method: ReturnType<typeof collectRpcMethods>[number],
	checker: ts.TypeChecker,
	policies: Required<CodecPolicies>,
): { argsTupleType: string; resultType: string; methodGenericArgs: string } {
	if (method.argsShape.kind !== "tuple") {
		throw new Error(`Expected tuple args shape for ${method.methodName}.`);
	}
	const argsTupleType = `[${method.argsShape.elements.map((shape: TypeNodeShape) => renderTypeNode(shape, policies, 0)).join(", ")}]`;
	const resultType = renderTypeNode(normalizeType(unwrapPromiseLikeType(method.resultType, checker), checker, policies), policies, 0);
	return {
		argsTupleType,
		resultType,
		methodGenericArgs: `${argsTupleType}, ${resultType}`,
	};
}

function renderInlineSurfaceDefinition(
	entries: Array<{
		methodName: string;
		argsTypeReference: string;
		resultTypeReference: string;
		signature: string;
		parameterNames: string[];
		argsShape: TypeNodeShape;
		resultShape: TypeNodeShape;
		pathParts: string[];
	}>,
	depth: number,
	pathPrefix: string[] = [],
): string {
	const indent = "\t".repeat(depth);
	const childIndent = "\t".repeat(depth + 1);
	const directMethods = entries.filter((entry) => entry.pathParts.length === pathPrefix.length + 1 && entry.pathParts.slice(0, pathPrefix.length).every((part, index) => part === pathPrefix[index]));
	const childGroups = [...new Set(entries
		.filter((entry) => entry.pathParts.length > pathPrefix.length + 1 && entry.pathParts.slice(0, pathPrefix.length).every((part, index) => part === pathPrefix[index]))
		.map((entry) => entry.pathParts[pathPrefix.length]!))].sort((a, b) => a.localeCompare(b));
	const lines = ["{"];
	for (const group of childGroups) {
		lines.push(`${childIndent}${JSON.stringify(group)}: ${renderInlineSurfaceDefinition(entries, depth + 1, [...pathPrefix, group])},`);
	}
	for (const entry of directMethods.sort((a, b) => a.methodName.localeCompare(b.methodName))) {
		const leafName = entry.pathParts[entry.pathParts.length - 1]!;
		lines.push(`${childIndent}${JSON.stringify(leafName)}: ${renderInlineRpcMethod(entry, depth + 1)},`);
	}
	lines.push(`${indent}}`);
	return lines.join("\n");
}

function renderInlineRpcMethod(entry: {
	methodName: string;
	argsTypeReference: string;
	resultTypeReference: string;
	signature: string;
	parameterNames: string[];
	argsShape: TypeNodeShape;
	resultShape: TypeNodeShape;
}, depth: number): string {
	const methodIdentifier = renderGeneratedMethodIdentifier(entry.methodName);
	const tupleArgs = `[${entry.parameterNames.join(", ")}]`;
	const indent = "\t".repeat(depth);
	const childIndent = "\t".repeat(depth + 1);
	return [
		`(async function ${methodIdentifier}(${entry.signature}): Promise<${entry.resultTypeReference}> {`,
		`${childIndent}const caller = (${methodIdentifier} as any)[NRPC_METHOD_CALLER] as undefined | ((method: RpcMethodRef<${entry.argsTypeReference}, ${entry.resultTypeReference}>, ...args: ${entry.argsTypeReference}) => Promise<${entry.resultTypeReference}>);`,
		`${childIndent}if (!caller) {`,
		`${childIndent}\tthrow new Error(${JSON.stringify(`${entry.methodName} cannot be invoked directly. Resolve it through your RPC caller.`)});`,
		`${childIndent}}`,
		`${childIndent}return caller(${methodIdentifier} as RpcMethodRef<${entry.argsTypeReference}, ${entry.resultTypeReference}>, ...(${tupleArgs} as ${entry.argsTypeReference}));`,
		`${indent}}) as RpcMethodRef<${entry.argsTypeReference}, ${entry.resultTypeReference}>`
	].join("\n");
}

function renderInlineSurfaceMetadataAttachment(
	globalName: string,
	entries: Array<{
		methodName: string;
		argsTypeReference: string;
		resultTypeReference: string;
		signature: string;
		parameterNames: string[];
		argsShape: TypeNodeShape;
		resultShape: TypeNodeShape;
		pathParts: string[];
	}>,
): string {
	const lines: string[] = [];
	for (const entry of entries) {
		const accessor = `${globalName}RpcDefinition${entry.pathParts.map((part) => `[${JSON.stringify(part)}]`).join("")}`;
		const codecValue = renderRpcMethodCodecValue({
			argsTypeReference: entry.argsTypeReference,
			resultTypeReference: entry.resultTypeReference,
			argsShape: entry.argsShape,
			resultShape: entry.resultShape,
		});
		lines.push(`(${accessor} as any).__nrpcMethodName = ${JSON.stringify(entry.methodName)};`);
		lines.push(`(${accessor} as any)[NRPC_METHOD_REF] = true;`);
		lines.push(`(${accessor} as any)[NRPC_METHOD_CODEC] = ${codecValue};`);
	}
	return lines.join("\n\n");
}

function renderRpcMethodCodecValue(options: {
	argsTypeReference: string;
	resultTypeReference: string;
	argsShape: TypeNodeShape;
	resultShape: TypeNodeShape;
}): string {
	const indentBlock = (text: string, indent: string): string => text.split("\n").map((line) => `${indent}${line}`).join("\n");
	const argsEncode = [
		"encode(value) {",
		"\tconst writer = new GeneratedCodecWriter();",
		...emitWriteExpression(options.argsShape, "value").map((line) => `\t${line}`),
		"\treturn writer.finish();",
		"}"
	].join("\n");
	const argsDecode = [
		"decode(data, offset = 0) {",
		"\tconst reader = new GeneratedCodecReader(data, offset);",
		`\tconst value = ${emitReadExpression(options.argsShape)} as ${options.argsTypeReference};`,
		"\treturn [value, reader.offset];",
		"}"
	].join("\n");
	const resultEncode = [
		"encode(value) {",
		"\tconst writer = new GeneratedCodecWriter();",
		...emitWriteExpression(options.resultShape, "value").map((line) => `\t${line}`),
		"\treturn writer.finish();",
		"}"
	].join("\n");
	const resultDecode = [
		"decode(data, offset = 0) {",
		"\tconst reader = new GeneratedCodecReader(data, offset);",
		`\tconst value = ${emitReadExpression(options.resultShape)} as ${options.resultTypeReference};`,
		"\treturn [value, reader.offset];",
		"}"
	].join("\n");
	return [
		"({",
		"\targs: {",
		indentBlock(argsEncode, "\t\t"),
		"\t\t,",
		indentBlock(argsDecode, "\t\t"),
		"\t},",
		"\tresult: {",
		indentBlock(resultEncode, "\t\t"),
		"\t\t,",
		indentBlock(resultDecode, "\t\t"),
		"\t}",
		`}) as RpcMethodCodec<${options.argsTypeReference}, ${options.resultTypeReference}>`
	].join("\n");
}

function renderRpcMethodImplementationSignature(
	argsShape: TypeNodeShape,
	parameterNames: string[],
	policies: Required<CodecPolicies>,
): string {
	if (argsShape.kind !== "tuple") {
		throw new Error("Expected tuple args shape for RPC method implementation signature.");
	}
	return argsShape.elements
		.map((element, index) => {
			const isOptional = element.kind === "optional";
			const typeShape = isOptional ? element.inner : element;
			return `${parameterNames[index] ?? `arg${index}`}${isOptional ? "?" : ""}: ${renderTypeNode(typeShape, policies, 0)}`;
		})
		.join(", ");
}

function renderGeneratedMethodIdentifier(methodName: string): string {
	const sanitized = methodName.replace(/[^A-Za-z0-9_$]/g, "_");
	const prefixed = /^[A-Za-z_$]/.test(sanitized) ? sanitized : `_${sanitized}`;
	return prefixed.length > 0 ? prefixed : "_nrpcMethod";
}

export function generateEndpointGlobalDeclaration(options: GenerateEndpointGlobalDeclarationOptions): string {
	const policies = defaultPolicies(options.policies);
	const program = createProgram(options.entryFile);
	const checker = program.getTypeChecker();
	const sourceFile = program.getSourceFile(options.entryFile);
	if (!sourceFile) throw new Error(`Could not load source file ${options.entryFile}`);
	const rootType = getTypeFromExportedAlias(sourceFile, checker, options.rootType);
	const aliasBody = renderRpcApiTypeLiteral(rootType, checker, policies, 0);
	return [
		`type ${options.declarationTypeName} = ${aliasBody};`,
		"",
		"declare global {",
		`  var ${options.globalName}: ${options.declarationTypeName};`,
		"}",
		"",
		"export {};",
	].join("\n");
}

function renderRpcApiTypeLiteral(type: ts.Type, checker: ts.TypeChecker, policies: Required<CodecPolicies>, depth: number): string {
	const indent = "  ".repeat(depth);
	const childIndent = "  ".repeat(depth + 1);
	const lines: string[] = ["{"];
	for (const property of checker.getPropertiesOfType(type)) {
		const declaration = property.valueDeclaration ?? property.declarations?.[0];
		if (!declaration) continue;
		const propertyType = checker.getTypeOfSymbolAtLocation(property, declaration);
		const signatures = checker.getSignaturesOfType(propertyType, ts.SignatureKind.Call);
		if (signatures.length > 0) {
			const signature = signatures[0]!;
			const parameters = signature.getParameters().map((parameter) => renderParameterDeclaration(parameter, checker, policies));
			const returnType = renderTypeNode(
				normalizeType(unwrapPromiseLikeType(checker.getReturnTypeOfSignature(signature), checker), checker, policies),
				policies,
				depth + 1,
			);
			lines.push(`${childIndent}${property.name}(${parameters.join(", ")}): Promise<${returnType}>;`);
			continue;
		}
		lines.push(`${childIndent}${property.name}: ${renderRpcApiTypeLiteral(propertyType, checker, policies, depth + 1)};`);
	}
	lines.push(`${indent}}`);
	return lines.join("\n");
}

function renderParameterDeclaration(parameter: ts.Symbol, checker: ts.TypeChecker, policies: Required<CodecPolicies>): string {
	const declaration = parameter.valueDeclaration ?? parameter.declarations?.[0];
	if (!declaration) {
		return `${parameter.name}: unknown`;
	}
	const type = checker.getTypeOfSymbolAtLocation(parameter, declaration);
	const normalized = normalizeType(type, checker, policies, parameter.name);
	const isOptionalParameter = ts.isParameter(declaration)
		? !!declaration.questionToken || !!declaration.initializer || !!declaration.dotDotDotToken
		: false;
	return `${parameter.name}${isOptionalParameter ? "?" : ""}: ${renderTypeNode(normalized, policies, 0)}`;
}

function renderTypeNode(shape: TypeNodeShape, policies: Required<CodecPolicies>, depth: number): string {
	switch (shape.kind) {
		case "primitive":
			return shape.primitive;
		case "bigint":
			return "bigint";
		case "unknown":
			return "unknown";
		case "literal":
			return JSON.stringify(shape.value);
		case "undefined":
			return "undefined";
		case "optional":
			return `${renderTypeNode(shape.inner, policies, depth)} | undefined`;
		case "date":
			return policies.date === "reject" ? "never" : "Date";
		case "map":
			return `Map<${renderTypeNode(shape.key, policies, depth)}, ${renderTypeNode(shape.value, policies, depth)}>`;
		case "set":
			return `Set<${renderTypeNode(shape.element, policies, depth)}>`;
		case "union":
			return shape.variants.map((variant) => renderTypeNode(variant, policies, depth)).join(" | ");
		case "discriminated-union":
			return shape.variants.map((variant) => renderObjectShape(variant.shape, policies, depth, shape.discriminator, variant.tagValue)).join(" | ");
		case "typed-array":
			return shape.arrayType;
		case "array":
			return `Array<${renderTypeNode(shape.element, policies, depth)}>`;
		case "tuple":
			return `[${shape.elements.map((element) => renderTypeNode(element, policies, depth)).join(", ")}]`;
		case "object":
			return renderObjectShape(shape, policies, depth);
	}
	return "unknown";
}

function renderObjectShape(shape: Extract<TypeNodeShape, { kind: "object" }>, policies: Required<CodecPolicies>, depth: number, discriminator?: string, tagValue?: string | number | boolean): string {
	const indent = "  ".repeat(depth);
	const childIndent = "  ".repeat(depth + 1);
	const lines: string[] = ["{"];
	for (const property of shape.properties) {
		if (discriminator && property.name === discriminator) {
			lines.push(`${childIndent}${property.name}: ${JSON.stringify(tagValue)};`);
			continue;
		}
		const optionalShape = property.shape.kind === "optional" ? property.shape : undefined;
		const typeText = renderTypeNode(optionalShape ? optionalShape.inner : property.shape, policies, depth + 1);
		lines.push(`${childIndent}${property.name}${optionalShape ? "?" : ""}: ${typeText};`);
	}
	lines.push(`${indent}}`);
	return lines.join("\n");
}

type RenderGeneratedSurfaceModuleOptions = {
	rootType: string;
	rootPath: string[];
	globalName: string;
	sourceImportPath: string;
	contractModulePath: string;
	methodModuleDir: string;
	methods: ReturnType<typeof collectRpcMethods>;
	codecByMethod: Map<string, { methodName: string; exportBase: string; code: string }>;
};

function renderGeneratedSurfaceModule(options: RenderGeneratedSurfaceModuleOptions): string {
	return [
		"// AUTO-GENERATED FILE. DO NOT EDIT.",
		`export {`,
		`\t${options.globalName}RpcDefinition,`,
		`} from ${JSON.stringify(options.contractModulePath)};`,
		""
	].join("\n");
}

function renderGeneratedCodecRegistryModule(options: {
	globalName: string;
	methodModuleDir: string;
	methods: ReturnType<typeof collectRpcMethods>;
	codecByMethod: Map<string, { methodName: string; exportBase: string; code: string }>;
}): string {
	const codecImports = options.methods
		.map((method) => {
			const codecModule = options.codecByMethod.get(method.methodName);
			if (!codecModule) throw new Error(`Missing codec module for ${method.methodName}`);
			return {
				importName: `${codecModule.exportBase}Codec`,
				path: `./${options.methodModuleDir}/${codecModule.exportBase}.codec.js`,
				methodName: method.methodName,
			};
		})
		.sort((a, b) => a.methodName.localeCompare(b.methodName));
	return [
		"// AUTO-GENERATED FILE. DO NOT EDIT.",
		`import { createRpcCodecRegistry } from \"@nogg-aholic/nrpc\";`,
		`import type { RpcMethodCodec } from \"@nogg-aholic/nrpc\";`,
		...codecImports.map((entry) => `import { ${entry.importName} } from ${JSON.stringify(entry.path)};`),
		"",
		`export const ${options.globalName}CodecEntries: ReadonlyArray<readonly [string, RpcMethodCodec<any[], any>]> = [`,
		...codecImports.map((entry) => `	[${JSON.stringify(entry.methodName)}, ${entry.importName}] as const,`),
		`];`,
		"",
		`export const ${options.globalName}CodecRegistry = createRpcCodecRegistry(${options.globalName}CodecEntries);`,
		""
	].join("\n");
}

function renderSurfaceDefinitionModule(options: {
	globalName: string;
	surfaceDefinition: HostRpcSurfaceDefinition;
	declarationTypeName: string;
	sourceImportPath: string;
}): string {
	const binding = options.surfaceDefinition.bindings[0];
	if (!binding) {
		throw new Error("Surface definition must contain at least one binding.");
	}

	return [
		"// AUTO-GENERATED FILE. DO NOT EDIT.",
		`import { defineHostRpcSurface } from \"@nogg-aholic/nrpc/synthetic-rpc-surface\";`,
		"",
		`export const ${options.globalName}HostRpcSurfaceDefinition = defineHostRpcSurface({`,
		`	id: ${JSON.stringify(options.surfaceDefinition.id)},`,
		`	rootPath: ${JSON.stringify(options.surfaceDefinition.rootPath)},`,
		`	declarationTypes: [${JSON.stringify(`type ${options.declarationTypeName} = import(${JSON.stringify(sourceImportPathForDeclaration(options.sourceImportPath))}).${options.declarationTypeName};`)}],`,
		"\tbindings: [",
		"\t\t{",
		`			name: ${JSON.stringify(binding.name)},`,
		`			declarationLines: [${binding.declarationLines.map((line) => JSON.stringify(line)).join(", ")}],`,
		`			runtimeExpression: ${JSON.stringify(binding.runtimeExpression)},`,
		binding.marker ? `			marker: ${JSON.stringify(binding.marker)},` : "",
		"\t\t},",
		"\t],",
		options.surfaceDefinition.declarationMarker ? `	declarationMarker: ${JSON.stringify(options.surfaceDefinition.declarationMarker)},` : "",
		options.surfaceDefinition.runtimeMarker ? `	runtimeMarker: ${JSON.stringify(options.surfaceDefinition.runtimeMarker)},` : "",
		"});",
		"",
	].filter(Boolean).join("\n");
}

type BuildSurfaceDefinitionOptions = {
	rootPath: string[];
	globalName: string;
	declarationTypeName: string;
	entryFile: string;
	outputImportPath: string;
	sourceImportPath: string;
	rootType: string;
};

function buildSurfaceDefinition(options: BuildSurfaceDefinitionOptions): HostRpcSurfaceDefinition {
	return {
		id: options.globalName,
		rootPath: options.rootPath,
		declarationTypes: [`type ${options.declarationTypeName} = import(${JSON.stringify(sourceImportPathForDeclaration(options.sourceImportPath))}).${options.declarationTypeName};`],
		bindings: [
			{
				name: options.globalName,
				declarationLines: [`  var ${options.globalName}: ${options.declarationTypeName};`],
				runtimeExpression: `${options.globalName}RpcSurface`,
				marker: `var ${options.globalName}: ${options.declarationTypeName};`
			}
		],
		declarationMarker: `var ${options.globalName}: ${options.declarationTypeName};`,
		runtimeMarker: `globalThis.${options.globalName} = globalThis.${options.globalName} ?? ${options.globalName}RpcSurface;`
	};
}

function toModuleRelativeImport(fromFile: string, targetFile: string): string {
	const relative = path.relative(path.dirname(fromFile), targetFile).replace(/\\/g, "/");
	return relative.startsWith(".") ? relative : `./${relative}`;
}

function sourceImportPathForDeclaration(sourceImportPath: string): string {
	return sourceImportPath.replace(/\.js$/, "");
}

function pascalize(value: string): string {
	return value.replace(/(^|[^a-zA-Z0-9]+)([a-zA-Z0-9])/g, (_match, _sep, chr: string) => chr.toUpperCase());
}
