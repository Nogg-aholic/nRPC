# rpcMethodRef.isRpcMethodRef

> **HTTP:** `POST /api/rpcMethodRef/isRpcMethodRef` | **Type:** `async function rpcMethodRef.isRpcMethodRef(value: unknown): Promise<value is RpcMethodRef<any[], any>>` | **Location:** [`../../src/index.ts:123`](../../src/index.ts:123)

## Signature

```typescript
async function rpcMethodRef.isRpcMethodRef(value: unknown): Promise<value is RpcMethodRef<any[], any>>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `unknown` | Yes | - |

## Returns

`value is RpcMethodRef<any[], any>`

Return value

## Implementation

```typescript
export function isRpcMethodRef(
  value: unknown,
): value is RpcMethodRef<any[], any> {
  if (!value || (typeof value !== "object" && typeof value !== "function")) {
    return false;
  }

  const candidate = value as RpcMethodRefMetadata;
  return (
    candidate[NRPC_METHOD_REF] === true ||
    typeof candidate.__nrpcMethodName === "string"
  );
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

#### `NRPC_METHOD_REF` (variable)
> **Location:** [`../../src/rpc-method-ref.ts:1`](../../src/rpc-method-ref.ts:1)

```typescript
NRPC_METHOD_REF = Symbol.for("@nogg-aholic/nrpc/method-ref")
```

#### `value is RpcMethodRef<any[], any>` (type)

**Description:** Return type
