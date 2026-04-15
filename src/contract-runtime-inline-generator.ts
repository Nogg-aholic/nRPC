import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as ts from "typescript";

type RuntimeSourceSpec = {
	path: string;
	names: string[];
};

let cachedContractRuntimePrelude: string | undefined;

const preludeSourceSpecs: RuntimeSourceSpec[] = [
	{
		path: "types.ts",
		names: ["TypedArrayTypes", "TypedArrayType", "RpcPayloadCodec", "RpcMethodCodec"],
	},
	{
		path: "rpc-method-ref.ts",
		names: ["NRPC_METHOD_REF", "NRPC_METHOD_CODEC", "NRPC_METHOD_CALLER", "RpcMethodCaller", "RpcMethodRefMetadata", "RpcMethodRef"],
	},
	{
		path: "http-route-runtime.ts",
		names: ["HttpProtocolMode", "HttpRouteManifestEntry", "HttpRouteManifest"],
	},
	{
		path: "encoding.ts",
		names: ["getTypedArrayType", "toUint8Array", "createTypedArray"],
	},
	{
		path: "generated-codec-runtime.ts",
		names: ["textEncoder", "textDecoder", "GeneratedCodecWriter", "GeneratedCodecReader"],
	},
];

export function renderInlinedContractRuntimePrelude(): string {
	if (cachedContractRuntimePrelude) {
		return cachedContractRuntimePrelude;
	}

	const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
	const statements = preludeSourceSpecs.flatMap((spec) => extractStatementsForPrelude(spec));
	cachedContractRuntimePrelude = statements
		.map((statement) => printStatementWithoutExports(statement, printer))
		.filter(Boolean)
		.join("\n\n");
	return cachedContractRuntimePrelude;
}

function extractStatementsForPrelude(spec: RuntimeSourceSpec): ts.Statement[] {
	const sourceFile = loadBestSourceFile(spec.path);
	const statementByName = new Map<string, ts.Statement>();

	for (const statement of sourceFile.statements) {
		const statementName = getStatementName(statement);
		if (statementName) {
			statementByName.set(statementName, statement);
		}
	}

	return spec.names.map((name) => {
		const statement = statementByName.get(name);
		if (!statement) {
			throw new Error(`Could not find ${name} in ${sourceFile.fileName}.`);
		}
		return statement;
	});
}

function loadBestSourceFile(relativeSourcePath: string): ts.SourceFile {
	const candidatePaths = resolveSourceCandidates(relativeSourcePath);
	for (const candidatePath of candidatePaths) {
		if (!fs.existsSync(candidatePath)) continue;
		return ts.createSourceFile(candidatePath, fs.readFileSync(candidatePath, "utf8"), ts.ScriptTarget.Latest, true, scriptKindForPath(candidatePath));
	}
	throw new Error(`Could not locate runtime source for ${relativeSourcePath}.`);
}

function resolveSourceCandidates(relativeSourcePath: string): string[] {
	const currentFilePath = fileURLToPath(import.meta.url);
	const currentDir = path.dirname(currentFilePath);
	const ext = path.extname(relativeSourcePath);
	const baseName = relativeSourcePath.slice(0, -ext.length);
	return [
		path.resolve(currentDir, relativeSourcePath),
		path.resolve(currentDir, "..", "src", relativeSourcePath),
		path.resolve(currentDir, "..", "dist", baseName + ".js"),
		path.resolve(currentDir, baseName + ".js"),
		path.resolve(currentDir, baseName + ".d.ts"),
		path.resolve(currentDir, "..", "dist", baseName + ".d.ts"),
	];
}

function scriptKindForPath(filePath: string): ts.ScriptKind {
	if (filePath.endsWith(".d.ts")) return ts.ScriptKind.TS;
	if (filePath.endsWith(".ts")) return ts.ScriptKind.TS;
	if (filePath.endsWith(".js")) return ts.ScriptKind.JS;
	return ts.ScriptKind.Unknown;
}

function getStatementName(statement: ts.Statement): string | undefined {
	if (ts.isTypeAliasDeclaration(statement)) return statement.name.text;
	if (ts.isEnumDeclaration(statement)) return statement.name.text;
	if (ts.isClassDeclaration(statement)) return statement.name?.text;
	if (ts.isFunctionDeclaration(statement)) return statement.name?.text;
	if (ts.isVariableStatement(statement)) {
		if (statement.declarationList.declarations.length !== 1) return undefined;
		const declaration = statement.declarationList.declarations[0];
		return declaration && ts.isIdentifier(declaration.name) ? declaration.name.text : undefined;
	}
	return undefined;
}

function printStatementWithoutExports(statement: ts.Statement, printer: ts.Printer): string {
	const sourceFile = statement.getSourceFile();
	const printed = printer.printNode(ts.EmitHint.Unspecified, statement, sourceFile).trim();
	return printed
		.replace(/^export\s+declare\s+/u, "")
		.replace(/^export\s+/u, "")
		.replace(/^declare\s+/u, "");
}