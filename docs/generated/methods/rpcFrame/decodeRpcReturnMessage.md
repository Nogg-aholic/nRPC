# rpcFrame.decodeRpcReturnMessage

> **HTTP:** `POST /api/rpcFrame/decodeRpcReturnMessage` | **Type:** `async function rpcFrame.decodeRpcReturnMessage(data: Uint8Array, expectedEventCode?: number): Promise<RpcReturnMessage>` | **Location:** [`../../src/index.ts:99`](../../src/index.ts:99)

## Signature

```typescript
async function rpcFrame.decodeRpcReturnMessage(data: Uint8Array, expectedEventCode?: number): Promise<RpcReturnMessage>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `Uint8Array` | Yes | - |
| `expectedEventCode` | `number` | No | - |

## Returns

`RpcReturnMessage`

Return value

## Implementation

```typescript
export function decodeRpcReturnMessage(
  data: Uint8Array,
  expectedEventCode?: number,
): RpcReturnMessage {
  if (expectedEventCode !== undefined && data[0] !== expectedEventCode) {
    throw new Error(`Unexpected RPC return event: ${data[0]}`);
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const requestId = view.getUint32(1, true);
  const ok = data[5] === 1;
  const [payload] = decodeRpcValue(data, 6);
  return { eventCode: data[0] ?? 0, requestId, ok, payload };
}
```

## Dependencies

### Internal

#### `RpcReturnMessage` (import)
> **Location:** [`../../src/rpc-frame.ts:7`](../../src/rpc-frame.ts:7)

```typescript
RpcReturnMessage
```

#### `decodeRpcValue` (import)
> **Location:** [`../../src/rpc-frame.ts:1`](../../src/rpc-frame.ts:1)

```typescript
decodeRpcValue
```

#### `RpcReturnMessage` (type)

**Description:** Return type
