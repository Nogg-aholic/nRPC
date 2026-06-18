# rpcMethodRef.getRpcMethodName

> **HTTP:** `POST /api/rpcMethodRef/getRpcMethodName` | **Type:** `async function rpcMethodRef.getRpcMethodName(value: unknown): Promise<string | undefined>` | **Location:** [`../../src/index.ts:122`](../../src/index.ts:122)

## Signature

```typescript
async function rpcMethodRef.getRpcMethodName(value: unknown): Promise<string | undefined>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `unknown` | Yes | - |

## Returns

`string | undefined`

Return value

## Implementation

```typescript
export function getRpcMethodName(value: unknown): string | undefined {
  if (!value || (typeof value !== "object" && typeof value !== "function")) {
    return undefined;
  }

  const candidate = value as RpcMethodRefMetadata;
  const methodName = candidate.__nrpcMethodName;
  return typeof methodName === "string" && methodName.length > 0
    ? methodName
    : undefined;
}
```

## Dependencies

### Internal

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

#### `string | undefined` (type)

**Description:** Return type
