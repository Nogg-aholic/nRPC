# rpcMethodRef.withRpcMethodCodec

> **HTTP:** `POST /api/rpcMethodRef/withRpcMethodCodec` | **Type:** `async function rpcMethodRef.withRpcMethodCodec(methodRef: RpcMethodRef<TArgs, TResult>, codec: RpcMethodCodec<TArgs, TResult>): Promise<RpcMethodRef<TArgs, TResult>>` | **Location:** [`../../src/index.ts:125`](../../src/index.ts:125)

## Signature

```typescript
async function rpcMethodRef.withRpcMethodCodec(methodRef: RpcMethodRef<TArgs, TResult>, codec: RpcMethodCodec<TArgs, TResult>): Promise<RpcMethodRef<TArgs, TResult>>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `methodRef` | `RpcMethodRef<TArgs, TResult>` | Yes | - |
| `codec` | `RpcMethodCodec<TArgs, TResult>` | Yes | - |

## Returns

`RpcMethodRef<TArgs, TResult>`

Return value

## Implementation

```typescript
export function withRpcMethodCodec<TArgs extends any[] = any[], TResult = any>(
  methodRef: RpcMethodRef<TArgs, TResult>,
  codec: RpcMethodCodec<TArgs, TResult>,
): RpcMethodRef<TArgs, TResult> {
  defineMethodCodecMetadata(
    methodRef as object,
    codec as RpcMethodCodec<any[], any>,
  );
  return methodRef;
}
```

## Dependencies

### Internal

#### `RpcMethodRef` (type)
> **Location:** [`../../src/rpc-method-ref.ts:18`](../../src/rpc-method-ref.ts:18)

```typescript
export type RpcMethodRef<Args extends any[] = any[], Result = any> = ((
  ...args: Args
) => Promise<Awaited<Result>>) &
  RpcMethodRefMetadata;
```

#### `RpcMethodCodec` (import)
> **Location:** [`../../src/rpc-method-ref.ts:5`](../../src/rpc-method-ref.ts:5)

```typescript
RpcMethodCodec
```

#### `defineMethodCodecMetadata` (function)
> **Location:** [`../../src/rpc-method-ref.ts:82`](../../src/rpc-method-ref.ts:82)

```typescript
function defineMethodCodecMetadata(
  target: object,
  codec: RpcMethodCodec<any[], any>,
): void {
  Object.defineProperty(target, NRPC_METHOD_CODEC, {
    value: codec,
    enumerable: false,
    configurable: false,
    writable: false,
  });
}
```

#### `RpcMethodRef<TArgs, TResult>` (type)

**Description:** Return type
