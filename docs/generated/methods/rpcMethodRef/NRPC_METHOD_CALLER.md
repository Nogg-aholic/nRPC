# rpcMethodRef.NRPC_METHOD_CALLER

> **HTTP:** `POST /api/rpcMethodRef/NRPC_METHOD_CALLER` | **Type:** `async function rpcMethodRef.NRPC_METHOD_CALLER(): Promise<typeof NRPC_METHOD_CALLER>` | **Location:** [`../../src/index.ts:109`](../../src/index.ts:109)

## Signature

```typescript
async function rpcMethodRef.NRPC_METHOD_CALLER(): Promise<typeof NRPC_METHOD_CALLER>
```

## Returns

`typeof NRPC_METHOD_CALLER`

Return value

## Implementation

```typescript
NRPC_METHOD_CALLER = Symbol.for("@nogg-aholic/nrpc/method-caller")
```

## Dependencies

### Internal

#### `typeof NRPC_METHOD_CALLER` (type)

**Description:** Return type
