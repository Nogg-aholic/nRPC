# webRuntime.attachRpcCallOptions

> **HTTP:** `POST /api/webRuntime/attachRpcCallOptions` | **Type:** `async function webRuntime.attachRpcCallOptions(surface: T): Promise<RpcClientSurfaceWithOptions<T>>` | **Location:** [`../../src/index.ts:138`](../../src/index.ts:138)

## Signature

```typescript
async function webRuntime.attachRpcCallOptions(surface: T): Promise<RpcClientSurfaceWithOptions<T>>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `surface` | `T` | Yes | - |

## Returns

`RpcClientSurfaceWithOptions<T>`

Return value

## Implementation

```typescript
export function attachRpcCallOptions<T>(
  surface: T,
): RpcClientSurfaceWithOptions<T> {
  return surface as RpcClientSurfaceWithOptions<T>;
}
```

## Dependencies

### Internal

#### `RpcClientSurfaceWithOptions` (type)
> **Location:** [`../../src/web-runtime.ts:153`](../../src/web-runtime.ts:153)

```typescript
export type RpcClientSurfaceWithOptions<T> = RpcClientSurface<T>;
```

#### `RpcClientSurfaceWithOptions<T>` (type)

**Description:** Return type
