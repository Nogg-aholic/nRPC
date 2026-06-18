# rpcFrame.decodeRpcAwaitMessage

> **HTTP:** `POST /api/rpcFrame/decodeRpcAwaitMessage` | **Type:** `async function rpcFrame.decodeRpcAwaitMessage(data: Uint8Array, expectedEventCode?: number): Promise<RpcAwaitMessage>` | **Location:** [`../../src/index.ts:94`](../../src/index.ts:94)

## Signature

```typescript
async function rpcFrame.decodeRpcAwaitMessage(data: Uint8Array, expectedEventCode?: number): Promise<RpcAwaitMessage>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `Uint8Array` | Yes | - |
| `expectedEventCode` | `number` | No | - |

## Returns

`RpcAwaitMessage`

Return value

## Implementation

```typescript
export function decodeRpcAwaitMessage(
  data: Uint8Array,
  expectedEventCode?: number,
): RpcAwaitMessage {
  if (expectedEventCode !== undefined && data[0] !== expectedEventCode) {
    throw new Error(`Unexpected RPC await event: ${data[0]}`);
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let offset = 1;
  const requestId = view.getUint32(offset, true);
  offset += 4;

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

  const [args] = decodeRpcValue(data, offset);
  return { eventCode: data[0] ?? 0, requestId, componentId, methodName, args };
}
```

## Dependencies

### Internal

#### `RpcAwaitMessage` (import)
> **Location:** [`../../src/rpc-frame.ts:3`](../../src/rpc-frame.ts:3)

```typescript
RpcAwaitMessage
```

#### `decoder` (variable)
> **Location:** [`../../src/rpc-frame.ts:11`](../../src/rpc-frame.ts:11)

```typescript
decoder = new TextDecoder()
```

#### `decodeRpcValue` (import)
> **Location:** [`../../src/rpc-frame.ts:1`](../../src/rpc-frame.ts:1)

```typescript
decodeRpcValue
```

#### `RpcAwaitMessage` (type)

**Description:** Return type
