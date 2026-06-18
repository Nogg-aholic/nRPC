# encoding.createTypedArray

> **HTTP:** `POST /api/encoding/createTypedArray` | **Type:** `async function encoding.createTypedArray(buffer: ArrayBufferLike, byteOffset: number, byteLength: number, arrayType: TypedArrayType): Promise<TypedArrayTypes>` | **Location:** [`../../src/index.ts:83`](../../src/index.ts:83)

## Signature

```typescript
async function encoding.createTypedArray(buffer: ArrayBufferLike, byteOffset: number, byteLength: number, arrayType: TypedArrayType): Promise<TypedArrayTypes>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `buffer` | `ArrayBufferLike` | Yes | - |
| `byteOffset` | `number` | Yes | - |
| `byteLength` | `number` | Yes | - |
| `arrayType` | `TypedArrayType` | Yes | - |

## Returns

`TypedArrayTypes`

Return value

## Implementation

```typescript
export function createTypedArray(
  buffer: ArrayBufferLike,
  byteOffset: number,
  byteLength: number,
  arrayType: TypedArrayType,
): TypedArrayTypes {
  const requiresAlignment =
    arrayType !== TypedArrayType.Int8 &&
    arrayType !== TypedArrayType.Uint8 &&
    arrayType !== TypedArrayType.Uint8Clamped;

  if (requiresAlignment) {
    const bytesPerElement =
      arrayType === TypedArrayType.Int16 || arrayType === TypedArrayType.Uint16
        ? 2
        : arrayType === TypedArrayType.Int32 ||
            arrayType === TypedArrayType.Uint32 ||
            arrayType === TypedArrayType.Float32
          ? 4
          : 8;
    const misaligned = byteOffset % bytesPerElement !== 0;
    if (misaligned) {
      const copied = new Uint8Array(byteLength);
      copied.set(new Uint8Array(buffer, byteOffset, byteLength));
      buffer = copied.buffer;
      byteOffset = 0;
    }
  }

  switch (arrayType) {
    case TypedArrayType.Int8:
      return new Int8Array(buffer, byteOffset, byteLength);
    case TypedArrayType.Uint8:
      return new Uint8Array(buffer, byteOffset, byteLength);
    case TypedArrayType.Uint8Clamped:
      return new Uint8ClampedArray(buffer, byteOffset, byteLength);
    case TypedArrayType.Int16:
      return new Int16Array(
        buffer,
        byteOffset,
        byteLength / Int16Array.BYTES_PER_ELEMENT,
      );
    case TypedArrayType.Uint16:
      return new Uint16Array(
        buffer,
        byteOffset,
        byteLength / Uint16Array.BYTES_PER_ELEMENT,
      );
    case TypedArrayType.Int32:
      return new Int32Array(
        buffer,
        byteOffset,
        byteLength / Int32Array.BYTES_PER_ELEMENT,
      );
    case TypedArrayType.Uint32:
      return new Uint32Array(
        buffer,
        byteOffset,
        byteLength / Uint32Array.BYTES_PER_ELEMENT,
      );
    case TypedArrayType.Float32:
      return new Float32Array(
        buffer,
        byteOffset,
        byteLength / Float32Array.BYTES_PER_ELEMENT,
      );
    case TypedArrayType.Float64:
      return new Float64Array(
        buffer,
        byteOffset,
        byteLength / Float64Array.BYTES_PER_ELEMENT,
      );
    case TypedArrayType.BigInt64:
      return new BigInt64Array(
        buffer,
        byteOffset,
        byteLength / BigInt64Array.BYTES_PER_ELEMENT,
      );
    case TypedArrayType.BigUint64:
      return new BigUint64Array(
        buffer,
        byteOffset,
        byteLength / BigUint64Array.BYTES_PER_ELEMENT,
      );
    default:
      throw new Error(`Unknown typed array type: ${arrayType}`);
  }
}
```

## Dependencies

### Internal

#### `TypedArrayType` (import)
> **Location:** [`../../src/encoding.ts:1`](../../src/encoding.ts:1)

```typescript
TypedArrayType
```

#### `TypedArrayTypes` (import)
> **Location:** [`../../src/encoding.ts:1`](../../src/encoding.ts:1)

```typescript
TypedArrayTypes
```

#### `TypedArrayTypes` (type)

**Description:** Return type
