# rpcFrame.encodeRpcAwaitMessage

> **HTTP:** `POST /api/rpcFrame/encodeRpcAwaitMessage` | **Type:** `async function rpcFrame.encodeRpcAwaitMessage(eventCode: number, requestId: number, methodName: string, args: unknown, componentId?: string): Promise<Uint8Array>` | **Location:** [`../../src/index.ts:101`](../../src/index.ts:101)

## Signature

```typescript
async function rpcFrame.encodeRpcAwaitMessage(eventCode: number, requestId: number, methodName: string, args: unknown, componentId?: string): Promise<Uint8Array>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `eventCode` | `number` | Yes | - |
| `requestId` | `number` | Yes | - |
| `methodName` | `string` | Yes | - |
| `args` | `unknown` | Yes | - |
| `componentId` | `string` | No | - |

## Returns

`Uint8Array`

Return value

## Implementation

```typescript
export function encodeRpcAwaitMessage(
  eventCode: number,
  requestId: number,
  methodName: string,
  args: unknown,
  componentId = "",
): Uint8Array {
  const componentIdBytes = encoder.encode(componentId);
  const methodNameBytes = encoder.encode(methodName);
  const argsBytes = encodeRpcValue(args ?? null);
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

#### `encoder` (variable)
> **Location:** [`../../src/rpc-frame.ts:10`](../../src/rpc-frame.ts:10)

```typescript
encoder = new TextEncoder()
```

#### `encodeRpcValue` (import)
> **Location:** [`../../src/rpc-frame.ts:1`](../../src/rpc-frame.ts:1)

```typescript
encodeRpcValue
```

#### `Uint8Array` (type)

**Description:** Return type
