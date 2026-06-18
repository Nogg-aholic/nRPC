# syntheticRpcSurface.defineHostRpcSurface

> **HTTP:** `POST /api/syntheticRpcSurface/defineHostRpcSurface` | **Type:** `async function syntheticRpcSurface.defineHostRpcSurface(definition: HostRpcSurfaceDefinition): Promise<HostRpcSurfaceDefinition>` | **Location:** [`../../src/index.ts:152`](../../src/index.ts:152)

## Signature

```typescript
async function syntheticRpcSurface.defineHostRpcSurface(definition: HostRpcSurfaceDefinition): Promise<HostRpcSurfaceDefinition>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `definition` | `HostRpcSurfaceDefinition` | Yes | - |

## Returns

`HostRpcSurfaceDefinition`

Return value

## Implementation

```typescript
export function defineHostRpcSurface(
  definition: HostRpcSurfaceDefinition,
): HostRpcSurfaceDefinition {
  return definition;
}
```

## Dependencies

### Internal

#### `HostRpcSurfaceDefinition` (type)
> **Location:** [`../../src/synthetic-rpc-surface.ts:19`](../../src/synthetic-rpc-surface.ts:19)

```typescript
export type HostRpcSurfaceDefinition = SyntheticRpcSurfaceDefinition;
```

#### `HostRpcSurfaceDefinition` (type)

**Description:** Return type
