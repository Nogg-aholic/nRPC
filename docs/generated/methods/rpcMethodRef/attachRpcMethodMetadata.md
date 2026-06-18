# rpcMethodRef.attachRpcMethodMetadata

> **HTTP:** `POST /api/rpcMethodRef/attachRpcMethodMetadata` | **Type:** `async function rpcMethodRef.attachRpcMethodMetadata(target: T, methodName: string): Promise<T>` | **Location:** [`../../src/index.ts:113`](../../src/index.ts:113)

## Signature

```typescript
async function rpcMethodRef.attachRpcMethodMetadata(target: T, methodName: string): Promise<T>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `target` | `T` | Yes | - |
| `methodName` | `string` | Yes | - |

## Returns

`T`

Return value

## Implementation

```typescript
export function attachRpcMethodMetadata<T extends object>(
  target: T,
  methodName: string,
): T {
  defineMethodRefMetadata(target, methodName);
  return target;
}
```

## Dependencies

### Internal

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

#### `T` (type)

**Description:** Return type
