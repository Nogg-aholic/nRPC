# rpcMethodRef.createNamedRpcMethodRef

> **HTTP:** `POST /api/rpcMethodRef/createNamedRpcMethodRef` | **Type:** `async function rpcMethodRef.createNamedRpcMethodRef(methodName: string): Promise<RpcMethodRef<TArgs, TResult>>` | **Location:** [`../../src/index.ts:115`](../../src/index.ts:115)

## Signature

```typescript
async function rpcMethodRef.createNamedRpcMethodRef(methodName: string): Promise<RpcMethodRef<TArgs, TResult>>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `methodName` | `string` | Yes | - |

## Returns

`RpcMethodRef<TArgs, TResult>`

Return value

## Implementation

```typescript
export function createNamedRpcMethodRef<
  TArgs extends any[] = any[],
  TResult = any,
>(methodName: string): RpcMethodRef<TArgs, TResult> {
  const ref = (async () => {
    throw new Error(
      `${methodName} cannot be invoked directly. Resolve it through your RPC caller.`,
    );
  }) as RpcMethodRef<TArgs, TResult>;

  defineMethodRefMetadata(ref as object, methodName);
  return ref;
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

#### `defineMethodRefMetadata` (function)
> **Location:** [`../../src/rpc-method-ref.ts:58`](../../src/rpc-method-ref.ts:58)

```typescript
function defineMethodRefMetadata(target: object, methodName: string): void {
  Object.defineProperty(target, "__nrpcMethodName", {
    value: methodName,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  Object.defineProperty(target, NRPC_METHOD_REF, {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });
}
```

#### `RpcMethodRef<TArgs, TResult>` (type)

**Description:** Return type
