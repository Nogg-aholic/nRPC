# valueCodec.decodeRpcValue

> **HTTP:** `POST /api/valueCodec/decodeRpcValue` | **Type:** `async function valueCodec.decodeRpcValue(data: Uint8Array, offset?: number): Promise<[unknown, number]>` | **Location:** [`../../src/index.ts:90`](../../src/index.ts:90)

## Signature

```typescript
async function valueCodec.decodeRpcValue(data: Uint8Array, offset?: number): Promise<[unknown, number]>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `Uint8Array` | Yes | - |
| `offset` | `number` | No | - |

## Returns

`[unknown, number]`

Return value

## Implementation

```typescript
export function decodeRpcValue(
  data: Uint8Array,
  offset = 0,
): [unknown, number] {
  return decodeRpcValueInternal(data, offset, offset);
}
```

## Dependencies

### Internal

#### `decodeRpcValueInternal` (function)
> **Location:** [`../../src/value-codec.ts:165`](../../src/value-codec.ts:165)

```typescript
function decodeRpcValueInternal(
  data: Uint8Array,
  offset: number,
  baseOffset: number,
): [unknown, number] {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const tag = data[offset++] as RpcArgTag;

  switch (tag) {
    case RpcArgTag.Null:
      return [null, offset];
    case RpcArgTag.Undefined:
      return [undefined, offset];
    case RpcArgTag.False:
      return [false, offset];
    case RpcArgTag.True:
      return [true, offset];
    case RpcArgTag.Float64: {
      const [value, next] = readF64(view, offset);
      return [value, next];
    }
    case RpcArgTag.BigInt64:
      return [view.getBigInt64(offset, true), offset + 8];
    case RpcArgTag.String: {
      const [len, next] = readU32(view, offset);
      const start = next;
      const end = start + len;
      return [decoder.decode(data.subarray(start, end)), end];
    }
    case RpcArgTag.TypedArray: {
      const arrayType = data[offset++] as TypedArrayType;
      const [byteLen, next] = readU32(view, offset);
      offset = baseOffset + align8(next - baseOffset);
      const start = offset;
      const end = start + byteLen;
      return [
        createTypedArray(
          data.buffer,
          data.byteOffset + start,
          byteLen,
          arrayType,
        ),
        end,
      ];
    }
    case RpcArgTag.Array: {
      const [count, next] = readU32(view, offset);
      offset = next;
      const values = new Array(count);
      for (let index = 0; index < count; index += 1) {
        [values[index], offset] = decodeRpcValueInternal(
          data,
          offset,
          baseOffset,
        );
      }
      return [values, offset];
    }
    case RpcArgTag.Object: {
      const [count, next] = readU32(view, offset);
      offset = next;
      const value: Record<string, unknown> = {};
      for (let index = 0; index < count; index += 1) {
        const [keyLen, keyNext] = readU16(view, offset);
        offset = keyNext;
        const key = decoder.decode(data.subarray(offset, offset + keyLen));
        offset += keyLen;
        [value[key], offset] = decodeRpcValueInternal(data, offset, baseOffset);
      }
      return [value, offset];
    }
    default:
      throw new Error(`[RPC] Unknown arg tag: ${tag}`);
  }
}
```

#### `[unknown, number]` (type)

**Description:** Return type
