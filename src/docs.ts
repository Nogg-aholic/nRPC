import {
	buildOpenApiMethodDocument,
	generateOpenApiArtifacts,
	type GenerateOpenApiArtifactsOptions,
} from './openapi-generator.js';
import { renderScalarHtml } from './scalar-html.js';
import type { OpenApiDocument, OpenApiMethodProjection } from './openapi-types.js';

export type GenerateDocsArtifactsOptions = GenerateOpenApiArtifactsOptions;

export type GeneratedDocsArtifacts = {
	json: OpenApiDocument;
	html: string;
	methods: OpenApiMethodProjection[];
};

export type GeneratedDocsRuntimeArtifacts = {
	json: {
		openapi: string;
		info: {
			title: string;
			version: string;
			description?: string;
		};
	};
	html: string;
	methods: ReadonlyMap<string, {
		methodName: string;
		httpPath: string;
		requestSchema: unknown;
		responseSchema: unknown;
		requestRequired: boolean;
		components?: {
			schemas: Record<string, unknown>;
		};
		docs?: {
			summary?: string;
			description?: string;
			returnsDescription?: string;
			tags?: string[];
			params?: Record<string, string>;
		};
	}>;
};

export type RenderGeneratedDocsArtifactsModuleOptions = {
	jsonExportName?: string;
	htmlExportName?: string;
	methodsExportName?: string;
};

export type ResolveGeneratedDocsResponseOptions = {
	method: string;
	requestUrl: URL;
	acceptHeader?: string;
	routeMethodName?: string | null;
	namespacePath: string;
	artifacts: GeneratedDocsRuntimeArtifacts;
	buildMethodTitle?: (methodName: string) => string;
	buildMethodDescription?: (methodName: string) => string;
	methodVersion?: string;
};

export type GeneratedDocsResponse = {
	status: number;
	kind: 'json' | 'html';
	body: unknown;
};

export function generateDocsArtifacts(options: GenerateDocsArtifactsOptions): GeneratedDocsArtifacts {
	const artifacts = generateOpenApiArtifacts(options);
	return {
		json: artifacts.document,
		html: artifacts.html,
		methods: artifacts.projections,
	};
}

export function renderGeneratedDocsArtifactsModule(
	artifacts: GeneratedDocsArtifacts,
	options: RenderGeneratedDocsArtifactsModuleOptions = {},
): string {
	const jsonExportName = options.jsonExportName ?? 'docsJson';
	const htmlExportName = options.htmlExportName ?? 'docsHtml';
	const methodsExportName = options.methodsExportName ?? 'docsMethods';

	return [
		'// AUTO-GENERATED FILE. DO NOT EDIT.',
		'',
		`export const ${jsonExportName} = ${JSON.stringify(artifacts.json, null, 2)};`,
		'',
		`export const ${htmlExportName} = ${JSON.stringify(artifacts.html)};`,
		'',
		`export const ${methodsExportName} = new Map(${JSON.stringify(artifacts.methods.map((projection) => [projection.methodName, projection]), null, 2)});`,
		'',
	].join('\n');
}

export function resolveGeneratedDocsResponse(
	options: ResolveGeneratedDocsResponseOptions,
): GeneratedDocsResponse | null {
	const normalizedMethod = options.method.toUpperCase();
	if (normalizedMethod !== 'GET') {
		return null;
	}

	const docsJsonPath = `${trimTrailingSlash(options.namespacePath)}/__docs/openapi.json`;
	if (options.requestUrl.pathname === docsJsonPath) {
		return {
			status: 200,
			kind: 'json',
			body: options.artifacts.json,
		};
	}

	const docsHtmlPath = `${trimTrailingSlash(options.namespacePath)}/__docs/scalar`;
	if (options.requestUrl.pathname === docsHtmlPath) {
		return {
			status: 200,
			kind: 'html',
			body: options.artifacts.html,
		};
	}

	if (!options.routeMethodName) {
		return null;
	}

	const projection = options.artifacts.methods.get(options.routeMethodName);
	if (!projection) {
		return {
			status: 404,
			kind: 'json',
			body: { ok: false, error: `No generated docs found for ${options.routeMethodName}.` },
		};
	}

	const document = buildOpenApiMethodDocument(projection as OpenApiMethodProjection, {
		title: options.buildMethodTitle?.(options.routeMethodName) ?? options.routeMethodName,
		version: options.methodVersion ?? options.artifacts.json.info.version,
		description: options.buildMethodDescription?.(options.routeMethodName)
			?? `Generated method documentation for ${options.routeMethodName}.`,
	});

	if (resolveDocsFormat(options.requestUrl, options.acceptHeader) === 'json') {
		return {
			status: 200,
			kind: 'json',
			body: document,
		};
	}

	return {
		status: 200,
		kind: 'html',
		body: renderScalarHtml(document, {
			pageTitle: options.buildMethodTitle?.(options.routeMethodName) ?? options.routeMethodName,
		}),
	};
}

function resolveDocsFormat(requestUrl: URL, acceptHeader: string | undefined): 'json' | 'html' {
	const explicit = requestUrl.searchParams.get('__docs')?.toLowerCase();
	if (explicit === 'json') return 'json';
	if (explicit === 'html') return 'html';
	if (acceptHeader?.includes('application/vnd.nrpc.openapi+json')) return 'json';
	return 'html';
}

function trimTrailingSlash(value: string): string {
	return value.endsWith('/') ? value.slice(0, -1) : value;
}