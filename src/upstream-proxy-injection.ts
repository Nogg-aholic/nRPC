export type UpstreamProxyInjectedGlobal = {
	name: string;
	declarationLines: string[];
	runtimeExpression: string;
	marker?: string;
};

export type UpstreamProxyInjectionDefinition = {
	id: string;
	rootPath: string[];
	declarationTypes?: string[];
	runtimePreludeLines?: string[];
	globals: UpstreamProxyInjectedGlobal[];
	declarationMarker?: string;
	runtimeMarker?: string;
};
