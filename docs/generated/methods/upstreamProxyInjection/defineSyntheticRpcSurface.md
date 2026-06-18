# upstreamProxyInjection.defineSyntheticRpcSurface

> **HTTP:** `POST /api/upstreamProxyInjection/defineSyntheticRpcSurface` | **Type:** `async function upstreamProxyInjection.defineSyntheticRpcSurface(definition: SyntheticRpcSurfaceDefinition): Promise<SyntheticRpcSurfaceDefinition>` | **Location:** [`../../src/index.ts:162`](../../src/index.ts:162)

## Signature

```typescript
async function upstreamProxyInjection.defineSyntheticRpcSurface(definition: SyntheticRpcSurfaceDefinition): Promise<SyntheticRpcSurfaceDefinition>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `definition` | `SyntheticRpcSurfaceDefinition` | Yes | - |

## Returns

`SyntheticRpcSurfaceDefinition`

Return value

## Implementation

```typescript
export function defineSyntheticRpcSurface(
  definition: SyntheticRpcSurfaceDefinition,
): SyntheticRpcSurfaceDefinition {
  return definition;
}
```

## Dependencies

### Internal

#### `SyntheticRpcSurfaceDefinition` (type)
> **Location:** [`../../src/synthetic-rpc-surface.ts:8`](../../src/synthetic-rpc-surface.ts:8)

```typescript
export type SyntheticRpcSurfaceDefinition = {
  id: string;
  rootPath: string[];
  declarationTypes?: string[];
  runtimePreludeLines?: string[];
  bindings: SyntheticRpcBinding[];
  declarationMarker?: string;
  runtimeMarker?: string;
};
```

#### `SyntheticRpcSurfaceDefinition` (type)

**Description:** Return type
