# rpcFrame.decodeRpcCallMessage

> **HTTP:** `POST /api/rpcFrame/decodeRpcCallMessage` | **Type:** `async function rpcFrame.decodeRpcCallMessage(data: Uint8Array, expectedEventCode?: number): Promise<RpcCallMessage>` | **Location:** [`../../src/index.ts:97`](../../src/index.ts:97)

## Signature

```typescript
async function rpcFrame.decodeRpcCallMessage(data: Uint8Array, expectedEventCode?: number): Promise<RpcCallMessage>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `Uint8Array` | Yes | - |
| `expectedEventCode` | `number` | No | - |

## Returns

`RpcCallMessage`

Return value

## Implementation

```typescript
export function decodeRpcCallMessage(
  data: Uint8Array,
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

  const [args] = decodeRpcValue(data, offset);
  return { eventCode: data[0] ?? 0, componentId, methodName, args };
}
```

## Dependencies

### Internal

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

#### `decodeRpcValue` (import)
> **Location:** [`../../src/rpc-frame.ts:1`](../../src/rpc-frame.ts:1)

```typescript
decodeRpcValue
```

#### `RpcCallMessage` (type)

**Description:** Return type
