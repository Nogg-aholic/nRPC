export type SyntheticRpcBinding = {
	name: string;
	declarationLines: string[];
	runtimeExpression: string;
	marker?: string;
};

export type SyntheticRpcSurfaceDefinition = {
	id: string;
	rootPath: string[];
	declarationTypes?: string[];
	runtimePreludeLines?: string[];
	bindings: SyntheticRpcBinding[];
	declarationMarker?: string;
	runtimeMarker?: string;
};

export type HostRpcBinding = SyntheticRpcBinding;
export type HostRpcSurfaceDefinition = SyntheticRpcSurfaceDefinition;

export type UpstreamProxyInjectedGlobal = SyntheticRpcBinding;

export type UpstreamProxyInjectionDefinition = Omit<SyntheticRpcSurfaceDefinition, 'bindings'> & {
	globals: UpstreamProxyInjectedGlobal[];
};

type SyntheticRpcSurfaceLike = SyntheticRpcSurfaceDefinition | UpstreamProxyInjectionDefinition;

export type BuildSyntheticRpcDeclarationOptions = {
	declarationTypesPrelude?: string[];
	trailingNewline?: boolean;
};

export type BuildSyntheticRpcRuntimeOptions = {
	rewriteRuntimeExpression?: (expression: string, binding: SyntheticRpcBinding) => string;
	assignTo?: string;
	trailingNewline?: boolean;
};

function getBindings(definition: SyntheticRpcSurfaceLike): SyntheticRpcBinding[] {
	if ('bindings' in definition) {
		return definition.bindings;
	}
	return definition.globals;
}

export function defineSyntheticRpcBinding(binding: SyntheticRpcBinding): SyntheticRpcBinding {
	return binding;
}

export function defineSyntheticRpcSurface(definition: SyntheticRpcSurfaceDefinition): SyntheticRpcSurfaceDefinition {
	return definition;
}

export function defineHostRpcSurface(definition: HostRpcSurfaceDefinition): HostRpcSurfaceDefinition {
	return definition;
}

export function asUpstreamProxyInjectionDefinition(
	definition: SyntheticRpcSurfaceLike,
): UpstreamProxyInjectionDefinition {
	if ('globals' in definition) {
		return definition;
	}

	return {
		id: definition.id,
		rootPath: definition.rootPath,
		declarationTypes: definition.declarationTypes,
		runtimePreludeLines: definition.runtimePreludeLines,
		globals: definition.bindings,
		declarationMarker: definition.declarationMarker,
		runtimeMarker: definition.runtimeMarker,
	};
}

export function buildSyntheticRpcDeclaration(
	definition: SyntheticRpcSurfaceLike,
	options: BuildSyntheticRpcDeclarationOptions = {},
): string {
	const lines = [
		...(options.declarationTypesPrelude ?? []),
		...(definition.declarationTypes ?? []),
		'',
		'declare global {',
		...getBindings(definition).flatMap((binding) => binding.declarationLines),
		'}',
		'',
		'export {};',
	];
	const out = lines.join('\n');
	return options.trailingNewline === false ? out : `${out}\n`;
}

export function buildSyntheticRpcRuntime(
	definition: SyntheticRpcSurfaceLike,
	options: BuildSyntheticRpcRuntimeOptions = {},
): string {
	const assignTo = options.assignTo ?? 'globalThis';
	const rewriteRuntimeExpression = options.rewriteRuntimeExpression ?? ((expression) => expression);
	const lines = [
		...(definition.runtimePreludeLines ?? []),
		...getBindings(definition).map((binding) => {
			const expression = rewriteRuntimeExpression(binding.runtimeExpression, binding);
			return `${assignTo}.${binding.name} = ${assignTo}.${binding.name} ?? ${expression};`;
		}),
	];
	const out = lines.join('\n');
	return options.trailingNewline === false ? out : `${out}\n`;
}
