# rpcFrame.encodeRpcReturnMessage

> **HTTP:** `POST /api/rpcFrame/encodeRpcReturnMessage` | **Type:** `async function rpcFrame.encodeRpcReturnMessage(eventCode: number, requestId: number, ok: boolean, payload: unknown): Promise<Uint8Array>` | **Location:** [`../../src/index.ts:105`](../../src/index.ts:105)

## Signature

```typescript
async function rpcFrame.encodeRpcReturnMessage(eventCode: number, requestId: number, ok: boolean, payload: unknown): Promise<Uint8Array>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `eventCode` | `number` | Yes | - |
| `requestId` | `number` | Yes | - |
| `ok` | `boolean` | Yes | - |
| `payload` | `unknown` | Yes | - |

## Returns

`Uint8Array`

Return value

## Implementation

```typescript
export function encodeRpcReturnMessage(
  eventCode: number,
  requestId: number,
  ok: boolean,
  payload: unknown,
): Uint8Array {
  const payloadBytes = encodeRpcValue(payload ?? null);
  const buf = new Uint8Array(1 + 4 + 1 + payloadBytes.length);
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  let offset = 0;
  buf[offset++] = eventCode & 0xff;
  view.setUint32(offset, requestId >>> 0, true);
  offset += 4;
  buf[offset++] = ok ? 1 : 0;
  buf.set(payloadBytes, offset);
  return buf;
}
```

## Dependencies

### Internal

#### `encodeRpcValue` (import)
> **Location:** [`../../src/rpc-frame.ts:1`](../../src/rpc-frame.ts:1)

```typescript
encodeRpcValue
```

#### `Uint8Array` (type)

**Description:** Return type
