# rpcFrame.encodeRpcCallMessage

> **HTTP:** `POST /api/rpcFrame/encodeRpcCallMessage` | **Type:** `async function rpcFrame.encodeRpcCallMessage(eventCode: number, methodName: string, args: unknown, componentId?: string): Promise<Uint8Array>` | **Location:** [`../../src/index.ts:103`](../../src/index.ts:103)

## Signature

```typescript
async function rpcFrame.encodeRpcCallMessage(eventCode: number, methodName: string, args: unknown, componentId?: string): Promise<Uint8Array>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `eventCode` | `number` | Yes | - |
| `methodName` | `string` | Yes | - |
| `args` | `unknown` | Yes | - |
| `componentId` | `string` | No | - |

## Returns

`Uint8Array`

Return value

## Implementation

```typescript
export function encodeRpcCallMessage(
  eventCode: number,
  methodName: string,
  args: unknown,
  componentId = "",
): Uint8Array {
  const componentIdBytes = encoder.encode(componentId);
  const methodNameBytes = encoder.encode(methodName);
  const argsBytes = encodeRpcValue(args ?? null);
  const buf = new Uint8Array(
    1 +
      1 +
      componentIdBytes.length +
      1 +
      methodNameBytes.length +
      argsBytes.length,
  );

  let offset = 0;
  buf[offset++] = eventCode & 0xff;
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
