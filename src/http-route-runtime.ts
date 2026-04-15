import type { RpcMethodCodec } from "./types.js";

export type HttpProtocolMode = "binary" | "json" | "both";

export type HttpRouteManifestEntry = {
	methodName: string;
	pathParts: string[];
	httpPath: string;
	codecLookupKey: string;
	protocolMode: HttpProtocolMode;
	argsTypeReference?: string;
	resultTypeReference?: string;
};

export type HttpRouteManifest = {
	id: string;
	rootPath: string[];
	basePath: string;
	protocolMode: HttpProtocolMode;
	routes: HttpRouteManifestEntry[];
};

export type HttpRouteMatch = {
	entry: HttpRouteManifestEntry;
	relativePath: string;
	protocol: "binary" | "json";
};

export type CreateHttpRouteMatcherOptions = {
	defaultProtocol?: "binary" | "json";
	binarySuffix?: string;
	jsonSuffix?: string;
};

export type RpcCodecResolver = (methodName: string) => RpcMethodCodec<any[], any> | undefined;

export function createHttpRouteMatcher(manifest: HttpRouteManifest, options: CreateHttpRouteMatcherOptions = {}): (pathname: string) => HttpRouteMatch | undefined {
	const defaultProtocol = options.defaultProtocol ?? "json";
	const binarySuffix = normalizeSuffix(options.binarySuffix ?? ".nrpc");
	const jsonSuffix = normalizeSuffix(options.jsonSuffix ?? ".json");
	const lookup = new Map<string, HttpRouteManifestEntry>();
	for (const route of manifest.routes) {
		lookup.set(normalizeHttpPath(route.httpPath), route);
	}

	return (pathname: string) => {
		const normalizedPath = normalizeHttpPath(pathname);
		const binaryPath = stripSuffix(normalizedPath, binarySuffix);
		if (binaryPath) {
			const entry = lookup.get(binaryPath);
			if (entry && routeSupportsProtocol(entry, "binary")) {
				return { entry, relativePath: binaryPath, protocol: "binary" };
			}
		}
		const jsonPath = stripSuffix(normalizedPath, jsonSuffix);
		if (jsonPath) {
			const entry = lookup.get(jsonPath);
			if (entry && routeSupportsProtocol(entry, "json")) {
				return { entry, relativePath: jsonPath, protocol: "json" };
			}
		}
		const entry = lookup.get(normalizedPath);
		if (!entry || !routeSupportsProtocol(entry, defaultProtocol)) {
			return undefined;
		}
		return { entry, relativePath: normalizedPath, protocol: defaultProtocol };
	};
}

export function routeSupportsProtocol(entry: HttpRouteManifestEntry, protocol: "binary" | "json"): boolean {
	return entry.protocolMode === "both" || entry.protocolMode === protocol;
}

function normalizeHttpPath(value: string): string {
	const normalized = value.replace(/\\/g, "/").trim();
	if (!normalized || normalized === "/") return "/";
	const withLeadingSlash = normalized.startsWith("/") ? normalized : `/${normalized}`;
	return withLeadingSlash.replace(/\/+$/g, "") || "/";
}

function normalizeSuffix(value: string): string {
	if (!value) return "";
	return value.startsWith(".") ? value : `.${value}`;
}

function stripSuffix(pathname: string, suffix: string): string | undefined {
	if (!suffix || !pathname.endsWith(suffix)) return undefined;
	const trimmed = pathname.slice(0, -suffix.length);
	return trimmed.length === 0 ? "/" : trimmed;
}