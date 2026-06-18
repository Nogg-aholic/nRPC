# valueCodec.encodeRpcValue

> **HTTP:** `POST /api/valueCodec/encodeRpcValue` | **Type:** `async function valueCodec.encodeRpcValue(value: unknown): Promise<Uint8Array>` | **Location:** [`../../src/index.ts:91`](../../src/index.ts:91)

## Signature

```typescript
async function valueCodec.encodeRpcValue(value: unknown): Promise<Uint8Array>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `unknown` | Yes | - |

## Returns

`Uint8Array`

Return value

## Implementation

```typescript
export function encodeRpcValue(value: unknown): Uint8Array {
  const end = measureInto(value, 0);
  const buf = new Uint8Array(end);
  encodeInto(buf, 0, value);
  return buf;
}
```

## Dependencies

### Internal

#### `measureInto` (function)
> **Location:** [`../../src/value-codec.ts:41`](../../src/value-codec.ts:41)

```typescript
function measureInto(value: unknown, offset: number): number {
  if (
    value === null ||
    value === undefined ||
    value === false ||
    value === true
  )
    return offset + 1;
  if (typeof value === "number" || typeof value === "bigint")
    return offset + 1 + 8;
  if (typeof value === "string") {
    const bytes = encoder.encode(value);
    return offset + 1 + 4 + bytes.length;
  }
  if (isTypedArray(value)) {
    const payloadBytes = toUint8Array(value);
    let next = offset + 1 + 1 + 4;
    next = align8(next);
    return next + payloadBytes.length;
  }
  if (Array.isArray(value)) {
    let next = offset + 1 + 4;
    for (const entry of value) next = measureInto(entry, next);
    return next;
  }
  if (isPlainObject(value)) {
    let next = offset + 1 + 4;
    for (const [key, entry] of Object.entries(value)) {
      const keyBytes = encoder.encode(key);
      next += 2 + keyBytes.length;
      next = measureInto(entry, next);
    }
    return next;
  }
  throw new Error(
    `[RPC] Unsupported arg type: ${Object.prototype.toString.call(value)}`,
  );
}
```

#### `encodeInto` (function)
> **Location:** [`../../src/value-codec.ts:80`](../../src/value-codec.ts:80)

```typescript
function encodeInto(buf: Uint8Array, offset: number, value: unknown): number {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  if (value === null) {
    buf[offset++] = RpcArgTag.Null;
    return offset;
  }
  if (value === undefined) {
    buf[offset++] = RpcArgTag.Undefined;
    return offset;
  }
  if (value === false) {
    buf[offset++] = RpcArgTag.False;
    return offset;
  }
  if (value === true) {
    buf[offset++] = RpcArgTag.True;
    return offset;
  }
  if (typeof value === "number") {
    buf[offset++] = RpcArgTag.Float64;
    return writeF64(view, offset, value);
  }
  if (typeof value === "bigint") {
    buf[offset++] = RpcArgTag.BigInt64;
    view.setBigInt64(offset, value, true);
    return offset + 8;
  }
  if (typeof value === "string") {
    buf[offset++] = RpcArgTag.String;
    const bytes = encoder.encode(value);
    offset = writeU32(view, offset, bytes.length);
    buf.set(bytes, offset);
    return offset + bytes.length;
  }
  if (isTypedArray(value)) {
    buf[offset++] = RpcArgTag.TypedArray;
    buf[offset++] = getTypedArrayType(value);
    const payloadBytes = toUint8Array(value);
    offset = writeU32(view, offset, payloadBytes.length);
    const aligned = align8(offset);
    buf.fill(0, offset, aligned);
    offset = aligned;
    buf.set(payloadBytes, offset);
    return offset + payloadBytes.length;
  }
  if (Array.isArray(value)) {
    buf[offset++] = RpcArgTag.Array;
    offset = writeU32(view, offset, value.length);
    for (const entry of value) offset = encodeInto(buf, offset, entry);
    return offset;
  }
  if (isPlainObject(value)) {
    buf[offset++] = RpcArgTag.Object;
    const entries = Object.entries(value);
    offset = writeU32(view, offset, entries.length);
    for (const [key, entry] of entries) {
      const keyBytes = encoder.encode(key);
      offset = writeU16(view, offset, keyBytes.length);
      buf.set(keyBytes, offset);
      offset += keyBytes.length;
      offset = encodeInto(buf, offset, entry);
    }
    return offset;
  }

  throw new Error(
    `[RPC] Unsupported arg type: ${Object.prototype.toString.call(value)}`,
  );
}
```

#### `Uint8Array` (type)

**Description:** Return type
