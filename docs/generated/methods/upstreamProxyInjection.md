# upstreamProxyInjection

> **HTTP:** `POST /api/upstreamProxyInjection` | **Type:** `async function upstreamProxyInjection(): Promise<{ readonly asUpstreamProxyInjectionDefinition: (definition: SyntheticRpcSurfaceLike) => UpstreamProxyInjectionDefinition; readonly buildSyntheticRpcDeclaration: (definition: SyntheticRpcSurfaceLike, options?: BuildSyntheticRpcDeclarationOptions) => string; readonly buildSyntheticRpcRuntime: (definition: SyntheticRpcSurfaceLike, options?: BuildSyntheticRpcRuntimeOptions) => string; readonly defineHostRpcSurface: (definition: SyntheticRpcSurfaceDefinition) => SyntheticRpcSurfaceDefinition; readonly defineSyntheticRpcBinding: (binding: SyntheticRpcBinding) => SyntheticRpcBinding; readonly defineSyntheticRpcSurface: (definition: SyntheticRpcSurfaceDefinition) => SyntheticRpcSurfaceDefinition; }>` | **Location:** [`../../src/index.ts:156`](../../src/index.ts:156)

## Signature

```typescript
async function upstreamProxyInjection(): Promise<{ readonly asUpstreamProxyInjectionDefinition: (definition: SyntheticRpcSurfaceLike) => UpstreamProxyInjectionDefinition; readonly buildSyntheticRpcDeclaration: (definition: SyntheticRpcSurfaceLike, options?: BuildSyntheticRpcDeclarationOptions) => string; readonly buildSyntheticRpcRuntime: (definition: SyntheticRpcSurfaceLike, options?: BuildSyntheticRpcRuntimeOptions) => string; readonly defineHostRpcSurface: (definition: SyntheticRpcSurfaceDefinition) => SyntheticRpcSurfaceDefinition; readonly defineSyntheticRpcBinding: (binding: SyntheticRpcBinding) => SyntheticRpcBinding; readonly defineSyntheticRpcSurface: (definition: SyntheticRpcSurfaceDefinition) => SyntheticRpcSurfaceDefinition; }>
```

## Returns

`{ readonly asUpstreamProxyInjectionDefinition: (definition: SyntheticRpcSurfaceLike) => UpstreamProxyInjectionDefinition; readonly buildSyntheticRpcDeclaration: (definition: SyntheticRpcSurfaceLike, options?: BuildSyntheticRpcDeclarationOptions) => string; readonly buildSyntheticRpcRuntime: (definition: SyntheticRpcSurfaceLike, options?: BuildSyntheticRpcRuntimeOptions) => string; readonly defineHostRpcSurface: (definition: SyntheticRpcSurfaceDefinition) => SyntheticRpcSurfaceDefinition; readonly defineSyntheticRpcBinding: (binding: SyntheticRpcBinding) => SyntheticRpcBinding; readonly defineSyntheticRpcSurface: (definition: SyntheticRpcSurfaceDefinition) => SyntheticRpcSurfaceDefinition; }`

Return value

## Implementation

```typescript
{
		asUpstreamProxyInjectionDefinition,
		buildSyntheticRpcDeclaration,
		buildSyntheticRpcRuntime,
		defineHostRpcSurface,
		defineSyntheticRpcBinding,
		defineSyntheticRpcSurface,
	}
```

## Dependencies

### Internal

#### `{ readonly asUpstreamProxyInjectionDefinition: (definition: SyntheticRpcSurfaceLike) => UpstreamProxyInjectionDefinition; readonly buildSyntheticRpcDeclaration: (definition: SyntheticRpcSurfaceLike, options?: BuildSyntheticRpcDeclarationOptions) => string; readonly buildSyntheticRpcRuntime: (definition: SyntheticRpcSurfaceLike, options?: BuildSyntheticRpcRuntimeOptions) => string; readonly defineHostRpcSurface: (definition: SyntheticRpcSurfaceDefinition) => SyntheticRpcSurfaceDefinition; readonly defineSyntheticRpcBinding: (binding: SyntheticRpcBinding) => SyntheticRpcBinding; readonly defineSyntheticRpcSurface: (definition: SyntheticRpcSurfaceDefinition) => SyntheticRpcSurfaceDefinition; }` (type)

**Description:** Return type
