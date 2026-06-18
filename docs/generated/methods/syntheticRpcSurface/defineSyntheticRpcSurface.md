# syntheticRpcSurface.defineSyntheticRpcSurface

> **HTTP:** `POST /api/syntheticRpcSurface/defineSyntheticRpcSurface` | **Type:** `async function syntheticRpcSurface.defineSyntheticRpcSurface(definition: SyntheticRpcSurfaceDefinition): Promise<SyntheticRpcSurfaceDefinition>` | **Location:** [`../../src/index.ts:154`](../../src/index.ts:154)

## Signature

```typescript
async function syntheticRpcSurface.defineSyntheticRpcSurface(definition: SyntheticRpcSurfaceDefinition): Promise<SyntheticRpcSurfaceDefinition>
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
