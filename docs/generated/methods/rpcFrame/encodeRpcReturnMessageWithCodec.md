# rpcFrame.encodeRpcReturnMessageWithCodec

> **HTTP:** `POST /api/rpcFrame/encodeRpcReturnMessageWithCodec` | **Type:** `async function rpcFrame.encodeRpcReturnMessageWithCodec(eventCode: number, requestId: number, ok: boolean, payload: unknown, codec?: RpcMethodCodec<any[], any>): Promise<Uint8Array>` | **Location:** [`../../src/index.ts:106`](../../src/index.ts:106)

## Signature

```typescript
async function rpcFrame.encodeRpcReturnMessageWithCodec(eventCode: number, requestId: number, ok: boolean, payload: unknown, codec?: RpcMethodCodec<any[], any>): Promise<Uint8Array>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `eventCode` | `number` | Yes | - |
| `requestId` | `number` | Yes | - |
| `ok` | `boolean` | Yes | - |
| `payload` | `unknown` | Yes | - |
| `codec` | `RpcMethodCodec<any[], any>` | No | - |

## Returns

`Uint8Array`

Return value

## Implementation

```typescript
export function encodeRpcReturnMessageWithCodec(
  eventCode: number,
  requestId: number,
  ok: boolean,
  payload: unknown,
  codec?: RpcMethodCodec<any[], any>,
): Uint8Array {
  const payloadBytes = encodePayloadWithCodec(
    payload,
    codec?.result as RpcPayloadCodec<unknown> | undefined,
  );
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

#### `RpcMethodCodec` (import)
> **Location:** [`../../src/rpc-frame.ts:5`](../../src/rpc-frame.ts:5)

```typescript
RpcMethodCodec
```

#### `encodePayloadWithCodec` (function)
> **Location:** [`../../src/rpc-frame.ts:13`](../../src/rpc-frame.ts:13)

```typescript
function encodePayloadWithCodec<T>(
  value: T,
  codec?: RpcPayloadCodec<T>,
): Uint8Array {
  return codec ? codec.encode(value) : encodeRpcValue(value ?? null);
}
```

#### `RpcPayloadCodec` (import)
> **Location:** [`../../src/rpc-frame.ts:6`](../../src/rpc-frame.ts:6)

```typescript
RpcPayloadCodec
```

#### `Uint8Array` (type)

**Description:** Return type
