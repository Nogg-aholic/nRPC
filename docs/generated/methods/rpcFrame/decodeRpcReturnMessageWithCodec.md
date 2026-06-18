# rpcFrame.decodeRpcReturnMessageWithCodec

> **HTTP:** `POST /api/rpcFrame/decodeRpcReturnMessageWithCodec` | **Type:** `async function rpcFrame.decodeRpcReturnMessageWithCodec(data: Uint8Array, codec?: RpcMethodCodec<any[], any>, expectedEventCode?: number): Promise<RpcReturnMessage>` | **Location:** [`../../src/index.ts:100`](../../src/index.ts:100)

## Signature

```typescript
async function rpcFrame.decodeRpcReturnMessageWithCodec(data: Uint8Array, codec?: RpcMethodCodec<any[], any>, expectedEventCode?: number): Promise<RpcReturnMessage>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `Uint8Array` | Yes | - |
| `codec` | `RpcMethodCodec<any[], any>` | No | - |
| `expectedEventCode` | `number` | No | - |

## Returns

`RpcReturnMessage`

Return value

## Implementation

```typescript
export function decodeRpcReturnMessageWithCodec(
  data: Uint8Array,
  codec?: RpcMethodCodec<any[], any>,
  expectedEventCode?: number,
): RpcReturnMessage {
  if (expectedEventCode !== undefined && data[0] !== expectedEventCode) {
    throw new Error(`Unexpected RPC return event: ${data[0]}`);
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const requestId = view.getUint32(1, true);
  const ok = data[5] === 1;
  const [payload] = ok
    ? decodePayloadWithCodec(
        data,
        6,
        codec?.result as RpcPayloadCodec<unknown> | undefined,
      )
    : decodeRpcValue(data, 6);
  return { eventCode: data[0] ?? 0, requestId, ok, payload };
}
```

## Dependencies

### Internal

#### `RpcMethodCodec` (import)
> **Location:** [`../../src/rpc-frame.ts:5`](../../src/rpc-frame.ts:5)

```typescript
RpcMethodCodec
```

#### `RpcReturnMessage` (import)
> **Location:** [`../../src/rpc-frame.ts:7`](../../src/rpc-frame.ts:7)

```typescript
RpcReturnMessage
```

#### `decodePayloadWithCodec` (function)
> **Location:** [`../../src/rpc-frame.ts:20`](../../src/rpc-frame.ts:20)

```typescript
function decodePayloadWithCodec<T>(
  data: Uint8Array,
  offset: number,
  codec?: RpcPayloadCodec<T>,
): [T, number] {
  return codec
    ? codec.decode(data, offset)
    : (decodeRpcValue(data, offset) as [T, number]);
}
```

#### `RpcPayloadCodec` (import)
> **Location:** [`../../src/rpc-frame.ts:6`](../../src/rpc-frame.ts:6)

```typescript
RpcPayloadCodec
```

#### `decodeRpcValue` (import)
> **Location:** [`../../src/rpc-frame.ts:1`](../../src/rpc-frame.ts:1)

```typescript
decodeRpcValue
```

#### `RpcReturnMessage` (type)

**Description:** Return type
