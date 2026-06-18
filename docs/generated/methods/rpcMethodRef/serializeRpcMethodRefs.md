# rpcMethodRef.serializeRpcMethodRefs

> **HTTP:** `POST /api/rpcMethodRef/serializeRpcMethodRefs` | **Type:** `async function rpcMethodRef.serializeRpcMethodRefs(value: unknown): Promise<unknown>` | **Location:** [`../../src/index.ts:124`](../../src/index.ts:124)

## Signature

```typescript
async function rpcMethodRef.serializeRpcMethodRefs(value: unknown): Promise<unknown>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `unknown` | Yes | - |

## Returns

`unknown`

Return value

## Implementation

```typescript
export function serializeRpcMethodRefs(value: unknown): unknown {
  const methodName = getRpcMethodName(value);
  if (methodName) {
    return { __nrpcMethodName: methodName };
  }

  if (Array.isArray(value)) {
    return value.map((entry) => serializeRpcMethodRefs(entry));
  }

  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      out[key] = serializeRpcMethodRefs(entry);
    }
    return out;
  }

  return value;
}
```

## Dependencies

### Internal

#### `getRpcMethodName` (function)
> **Location:** [`../../src/rpc-method-ref.ts:320`](../../src/rpc-method-ref.ts:320)

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

#### `unknown` (type)

**Description:** Return type
