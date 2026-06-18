# encoding.getTypedArrayType

> **HTTP:** `POST /api/encoding/getTypedArrayType` | **Type:** `async function encoding.getTypedArrayType(value: TypedArrayTypes): Promise<TypedArrayType>` | **Location:** [`../../src/index.ts:84`](../../src/index.ts:84)

## Signature

```typescript
async function encoding.getTypedArrayType(value: TypedArrayTypes): Promise<TypedArrayType>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `TypedArrayTypes` | Yes | - |

## Returns

`TypedArrayType`

Return value

## Implementation

```typescript
export function getTypedArrayType(value: TypedArrayTypes): TypedArrayType {
  if (value instanceof Int8Array) return TypedArrayType.Int8;
  if (value instanceof Uint8Array) return TypedArrayType.Uint8;
  if (value instanceof Uint8ClampedArray) return TypedArrayType.Uint8Clamped;
  if (value instanceof Int16Array) return TypedArrayType.Int16;
  if (value instanceof Uint16Array) return TypedArrayType.Uint16;
  if (value instanceof Int32Array) return TypedArrayType.Int32;
  if (value instanceof Uint32Array) return TypedArrayType.Uint32;
  if (value instanceof Float32Array) return TypedArrayType.Float32;
  if (value instanceof Float64Array) return TypedArrayType.Float64;
  if (value instanceof BigInt64Array) return TypedArrayType.BigInt64;
  if (value instanceof BigUint64Array) return TypedArrayType.BigUint64;
  throw new Error("Unsupported typed array.");
}
```

## Dependencies

### Internal

#### `TypedArrayTypes` (import)
> **Location:** [`../../src/encoding.ts:1`](../../src/encoding.ts:1)

```typescript
TypedArrayTypes
```

#### `TypedArrayType` (import)
> **Location:** [`../../src/encoding.ts:1`](../../src/encoding.ts:1)

```typescript
TypedArrayType
```

#### `TypedArrayType` (type)

**Description:** Return type
