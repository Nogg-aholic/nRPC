# rpcFrame.decodeRpcCallMessageWithCodec

> **HTTP:** `POST /api/rpcFrame/decodeRpcCallMessageWithCodec` | **Type:** `async function rpcFrame.decodeRpcCallMessageWithCodec(data: Uint8Array, codec?: RpcMethodCodec<any[], any>, expectedEventCode?: number): Promise<RpcCallMessage>` | **Location:** [`../../src/index.ts:98`](../../src/index.ts:98)

## Signature

```typescript
async function rpcFrame.decodeRpcCallMessageWithCodec(data: Uint8Array, codec?: RpcMethodCodec<any[], any>, expectedEventCode?: number): Promise<RpcCallMessage>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `Uint8Array` | Yes | - |
| `codec` | `RpcMethodCodec<any[], any>` | No | - |
| `expectedEventCode` | `number` | No | - |

## Returns

`RpcCallMessage`

Return value

## Implementation

```typescript
export function decodeRpcCallMessageWithCodec(
  data: Uint8Array,
  codec?: RpcMethodCodec<any[], any>,
  expectedEventCode?: number,
): RpcCallMessage {
  if (expectedEventCode !== undefined && data[0] !== expectedEventCode) {
    throw new Error(`Unexpected RPC call event: ${data[0]}`);
  }

  let offset = 1;
  const componentIdLen = data[offset++];
  const componentId = decoder.decode(
    data.subarray(offset, offset + componentIdLen),
  );
  offset += componentIdLen;

  const methodNameLen = data[offset++];
  const methodName = decoder.decode(
    data.subarray(offset, offset + methodNameLen),
  );
  offset += methodNameLen;

  // When no codec is supplied (e.g. a header-only probe to discover the methodName before
  // resolving its codec), the args section may have been encoded with a generated codec
  // and is therefore not safely decodable via the generic value codec — skip it.
  const args = codec
    ? decodePayloadWithCodec(
        data,
        offset,
        codec.args as RpcPayloadCodec<unknown> | undefined,
      )[0]
    : undefined;
  return { eventCode: data[0] ?? 0, componentId, methodName, args };
}
```

## Dependencies

### Internal

#### `RpcMethodCodec` (import)
> **Location:** [`../../src/rpc-frame.ts:5`](../../src/rpc-frame.ts:5)

```typescript
RpcMethodCodec
```

#### `RpcCallMessage` (import)
> **Location:** [`../../src/rpc-frame.ts:4`](../../src/rpc-frame.ts:4)

```typescript
RpcCallMessage
```

#### `decoder` (variable)
> **Location:** [`../../src/rpc-frame.ts:11`](../../src/rpc-frame.ts:11)

```typescript
decoder = new TextDecoder()
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

#### `RpcCallMessage` (type)

**Description:** Return type
