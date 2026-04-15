import path from "node:path";
import * as ts from "typescript";
import {
	camelize,
	collectRpcMethods,
	createProgram,
	defaultPolicies,
	generateRpcSurfaceCodecModules,
	getTypeFromExportedAlias,
	normalizeType,
	renderRpcCodecModule,
	type TypeNodeShape,
	unwrapPromiseLikeType,
	type CodecPolicies
} from "./codec-generator.js";
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
	runtimeText: string;
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
	const declarationTypeName = options.declarationTypeName ?? `__nrpcGenerated${pascalize(globalName)}Api`;
	const outputDir = path.dirname(options.outputImportPath);
	const methodModuleDir = options.methodModuleDir ?? `${globalName}.codecs`;
	const sourceImportPath = options.moduleSpecifier ?? toModuleRelativeImport(options.outputImportPath, options.entryFile).replace(/\.ts$/, ".js");
	const methods = collectRpcMethods(rootType, checker, policies);
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
	for (const module of codecModules) {
		files.push({
			path: path.join(outputDir, methodModuleDir, `${module.exportBase}.codec.ts`),
			content: module.code
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
			declarationTypeName,
			sourceImportPath,
			methodModuleDir,
			methods,
			codecByMethod
		})
	});
	const surfaceDefinition = buildSurfaceDefinition({
		rootPath,
		globalName,
		declarationTypeName,
		entryFile: options.entryFile,
		outputImportPath: options.outputImportPath,
		sourceImportPath,
		rootType: options.rootType
	});
	return {
		surfaceDefinition,
		declarationText: buildSyntheticRpcDeclaration(surfaceDefinition),
		runtimeText: buildSyntheticRpcRuntime(surfaceDefinition),
		files
	};
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
	declarationTypeName: string;
	sourceImportPath: string;
	methodModuleDir: string;
	methods: ReturnType<typeof collectRpcMethods>;
	codecByMethod: Map<string, { methodName: string; exportBase: string; code: string }>;
};

function renderGeneratedSurfaceModule(options: RenderGeneratedSurfaceModuleOptions): string {
	const codecImports = options.methods
		.map((method) => {
			const codecModule = options.codecByMethod.get(method.methodName);
			if (!codecModule) throw new Error(`Missing codec module for ${method.methodName}`);
			return {
				importName: `${codecModule.exportBase}Codec`,
				path: `./${options.methodModuleDir}/${codecModule.exportBase}.codec.js`,
				methodName: method.methodName,
				pathParts: method.path
			};
		})
		.sort((a, b) => a.methodName.localeCompare(b.methodName));
	return [
		"// AUTO-GENERATED FILE. DO NOT EDIT.",
		`import { createEndpointSurface, createRpcCodecRegistry } from \"@nogg-aholic/nrpc\";`,
		`import type { Rpcify } from \"@nogg-aholic/nrpc\";`,
		`import type { ${options.rootType} } from ${JSON.stringify(options.sourceImportPath)};`,
		...codecImports.map((entry) => `import { ${entry.importName} } from ${JSON.stringify(entry.path)};`),
		"",
		`export type ${options.declarationTypeName} = Rpcify<${options.rootType}>;`,
		"",
		`export const ${options.globalName}CodecRegistry = createRpcCodecRegistry([`,
		...codecImports.map((entry) => `	[${JSON.stringify(entry.methodName)}, ${entry.importName}] as const,`),
		`]);`,
		"",
		`export function create${pascalize(options.globalName)}RpcSurface(): ${options.declarationTypeName} {`,
		`\treturn createEndpointSurface<${options.rootType}>(${JSON.stringify(options.rootPath)}, { codecResolver: ${options.globalName}CodecRegistry });`,
		"}",
		"",
		`export const ${options.globalName}RpcSurface = create${pascalize(options.globalName)}RpcSurface();`,
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
