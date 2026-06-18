# rpcMethodRef.defineEndpointSurface

> **HTTP:** `POST /api/rpcMethodRef/defineEndpointSurface` | **Type:** `async function rpcMethodRef.defineEndpointSurface(surface: T): Promise<T>` | **Location:** [`../../src/index.ts:119`](../../src/index.ts:119)

## Signature

```typescript
async function rpcMethodRef.defineEndpointSurface(surface: T): Promise<T>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `surface` | `T` | Yes | - |

## Returns

`T`

Return value

## Implementation

```typescript
export function defineEndpointSurface<T extends object>(surface: T): T {
  return surface;
}
```

## Dependencies

### Internal

#### `T` (type)

**Description:** Return type
