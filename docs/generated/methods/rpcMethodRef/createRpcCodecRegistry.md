# rpcMethodRef.createRpcCodecRegistry

> **HTTP:** `POST /api/rpcMethodRef/createRpcCodecRegistry` | **Type:** `async function rpcMethodRef.createRpcCodecRegistry(entries: Iterable<readonly [string, RpcMethodCodec<any[], any>]>): Promise<RpcMethodCodecResolver>` | **Location:** [`../../src/index.ts:116`](../../src/index.ts:116)

## Signature

```typescript
async function rpcMethodRef.createRpcCodecRegistry(entries: Iterable<readonly [string, RpcMethodCodec<any[], any>]>): Promise<RpcMethodCodecResolver>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `entries` | `Iterable<readonly [string, RpcMethodCodec<any[], any>]>` | Yes | - |

## Returns

`RpcMethodCodecResolver`

Return value

## Implementation

```typescript
export function createRpcCodecRegistry(
  entries: Iterable<readonly [string, RpcMethodCodec<any[], any>]>,
): RpcMethodCodecResolver {
  const registry = new Map<string, RpcMethodCodec<any[], any>>(entries);
  return (methodName: string) => registry.get(methodName);
}
```

## Dependencies

### Internal

#### `RpcMethodCodec` (import)
> **Location:** [`../../src/rpc-method-ref.ts:5`](../../src/rpc-method-ref.ts:5)

```typescript
RpcMethodCodec
```

#### `RpcMethodCodecResolver` (type)
> **Location:** [`../../src/rpc-method-ref.ts:125`](../../src/rpc-method-ref.ts:125)

```typescript
export type RpcMethodCodecResolver = (
  methodName: string,
) => RpcMethodCodec<any[], any> | undefined;
```

#### `RpcMethodCodecResolver` (type)

**Description:** Return type
