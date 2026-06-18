# upstreamProxyInjection.defineHostRpcSurface

> **HTTP:** `POST /api/upstreamProxyInjection/defineHostRpcSurface` | **Type:** `async function upstreamProxyInjection.defineHostRpcSurface(definition: HostRpcSurfaceDefinition): Promise<HostRpcSurfaceDefinition>` | **Location:** [`../../src/index.ts:160`](../../src/index.ts:160)

## Signature

```typescript
async function upstreamProxyInjection.defineHostRpcSurface(definition: HostRpcSurfaceDefinition): Promise<HostRpcSurfaceDefinition>
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
