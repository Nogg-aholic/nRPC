# rpcMethodRef.getRpcMethodCodec

> **HTTP:** `POST /api/rpcMethodRef/getRpcMethodCodec` | **Type:** `async function rpcMethodRef.getRpcMethodCodec(value: unknown): Promise<RpcMethodCodec<Args, Result> | undefined>` | **Location:** [`../../src/index.ts:121`](../../src/index.ts:121)

## Signature

```typescript
async function rpcMethodRef.getRpcMethodCodec(value: unknown): Promise<RpcMethodCodec<Args, Result> | undefined>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `unknown` | Yes | - |

## Returns

`RpcMethodCodec<Args, Result> | undefined`

Return value

## Implementation

```typescript
export function getRpcMethodCodec<Args extends any[] = any[], Result = any>(
  value: unknown,
): RpcMethodCodec<Args, Result> | undefined {
  if (!value || (typeof value !== "object" && typeof value !== "function")) {
    return undefined;
  }

  const candidate = value as RpcMethodRefMetadata;
  const codec = candidate[NRPC_METHOD_CODEC];
  return codec as RpcMethodCodec<Args, Result> | undefined;
}
```

## Dependencies

### Internal

#### `RpcMethodCodec` (import)
> **Location:** [`../../src/rpc-method-ref.ts:5`](../../src/rpc-method-ref.ts:5)

```typescript
RpcMethodCodec
```

#### `RpcMethodRefMetadata` (type)
> **Location:** [`../../src/rpc-method-ref.ts:9`](../../src/rpc-method-ref.ts:9)

```typescript
type RpcMethodRefMetadata = {
  __nrpcMethodName?: string;
  [NRPC_METHOD_REF]?: true;
  [NRPC_METHOD_CODEC]?: RpcMethodCodec<any[], any>;
  [NRPC_METHOD_CALLER]?: RpcMethodCaller;
};
```

#### `NRPC_METHOD_CODEC` (variable)
> **Location:** [`../../src/rpc-method-ref.ts:2`](../../src/rpc-method-ref.ts:2)

```typescript
NRPC_METHOD_CODEC = Symbol.for("@nogg-aholic/nrpc/method-codec")
```

#### `RpcMethodCodec<Args, Result> | undefined` (type)

**Description:** Return type
