# rpcFrame.decodeRpcAwaitMethodName

> **HTTP:** `POST /api/rpcFrame/decodeRpcAwaitMethodName` | **Type:** `async function rpcFrame.decodeRpcAwaitMethodName(data: Uint8Array, expectedEventCode?: number): Promise<string>` | **Location:** [`../../src/index.ts:96`](../../src/index.ts:96)

## Signature

```typescript
async function rpcFrame.decodeRpcAwaitMethodName(data: Uint8Array, expectedEventCode?: number): Promise<string>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `Uint8Array` | Yes | - |
| `expectedEventCode` | `number` | No | - |

## Returns

`string`

Return value

## Implementation

```typescript
export function decodeRpcAwaitMethodName(
  data: Uint8Array,
  expectedEventCode?: number,
): string {
  if (expectedEventCode !== undefined && data[0] !== expectedEventCode) {
    throw new Error(`Unexpected RPC await event: ${data[0]}`);
  }

  let offset = 1 + 4;
  const componentIdLen = data[offset++] ?? 0;
  offset += componentIdLen;

  const methodNameLen = data[offset++] ?? 0;
  return decoder.decode(data.subarray(offset, offset + methodNameLen));
}
```

## Dependencies

### Internal

#### `decoder` (variable)
> **Location:** [`../../src/rpc-frame.ts:11`](../../src/rpc-frame.ts:11)

```typescript
decoder = new TextDecoder()
```

#### `string` (type)

**Description:** Return type
