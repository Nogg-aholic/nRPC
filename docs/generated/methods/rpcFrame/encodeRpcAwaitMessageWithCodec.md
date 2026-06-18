# rpcFrame.encodeRpcAwaitMessageWithCodec

> **HTTP:** `POST /api/rpcFrame/encodeRpcAwaitMessageWithCodec` | **Type:** `async function rpcFrame.encodeRpcAwaitMessageWithCodec(eventCode: number, requestId: number, methodName: string, args: unknown, codec?: RpcMethodCodec<any[], any>, componentId?: string): Promise<Uint8Array>` | **Location:** [`../../src/index.ts:102`](../../src/index.ts:102)

## Signature

```typescript
async function rpcFrame.encodeRpcAwaitMessageWithCodec(eventCode: number, requestId: number, methodName: string, args: unknown, codec?: RpcMethodCodec<any[], any>, componentId?: string): Promise<Uint8Array>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `eventCode` | `number` | Yes | - |
| `requestId` | `number` | Yes | - |
| `methodName` | `string` | Yes | - |
| `args` | `unknown` | Yes | - |
| `codec` | `RpcMethodCodec<any[], any>` | No | - |
| `componentId` | `string` | No | - |

## Returns

`Uint8Array`

Return value

## Implementation

```typescript
export function encodeRpcAwaitMessageWithCodec(
  eventCode: number,
  requestId: number,
  methodName: string,
  args: unknown,
  codec?: RpcMethodCodec<any[], any>,
  componentId = "",
): Uint8Array {
  const componentIdBytes = encoder.encode(componentId);
  const methodNameBytes = encoder.encode(methodName);
  const argsBytes = encodePayloadWithCodec(
    args,
    codec?.args as RpcPayloadCodec<unknown> | undefined,
  );
  const buf = new Uint8Array(
    1 +
      4 +
      1 +
      componentIdBytes.length +
      1 +
      methodNameBytes.length +
      argsBytes.length,
  );
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  let offset = 0;
  buf[offset++] = eventCode & 0xff;
  view.setUint32(offset, requestId >>> 0, true);
  offset += 4;
  buf[offset++] = componentIdBytes.length;
  buf.set(componentIdBytes, offset);
  offset += componentIdBytes.length;
  buf[offset++] = methodNameBytes.length;
  buf.set(methodNameBytes, offset);
  offset += methodNameBytes.length;
  buf.set(argsBytes, offset);
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

#### `encoder` (variable)
> **Location:** [`../../src/rpc-frame.ts:10`](../../src/rpc-frame.ts:10)

```typescript
encoder = new TextEncoder()
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
