# rpcMethodRef.defineRpcMethodRef

> **HTTP:** `POST /api/rpcMethodRef/defineRpcMethodRef` | **Type:** `async function rpcMethodRef.defineRpcMethodRef(callable: TCallable): Promise<RpcMethodRefFromCallable<TCallable>>` | **Location:** [`../../src/index.ts:120`](../../src/index.ts:120)

## Signature

```typescript
async function rpcMethodRef.defineRpcMethodRef(callable: TCallable): Promise<RpcMethodRefFromCallable<TCallable>>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `callable` | `TCallable` | Yes | - |

## Returns

`RpcMethodRefFromCallable<TCallable>`

Return value

## Implementation

```typescript
export function defineRpcMethodRef<
  TCallable extends (...args: any[]) => Promise<any>,
>(callable: TCallable): RpcMethodRefFromCallable<TCallable> {
  return callable as RpcMethodRefFromCallable<TCallable>;
}
```

## Dependencies

### Internal

#### `RpcMethodRefFromCallable` (type)
> **Location:** [`../../src/rpc-method-ref.ts:26`](../../src/rpc-method-ref.ts:26)

```typescript
export type RpcMethodRefFromCallable<
  TCallable extends (...args: any[]) => Promise<any>,
> = RpcMethodRef<Parameters<TCallable>, Awaited<ReturnType<TCallable>>>;
```

#### `RpcMethodRefFromCallable<TCallable>` (type)

**Description:** Return type
