# types.TypedArrayType

> **HTTP:** `POST /api/types/TypedArrayType` | **Type:** `async function types.TypedArrayType(): Promise<typeof TypedArrayType>` | **Location:** [`../../src/index.ts:79`](../../src/index.ts:79)

## Signature

```typescript
async function types.TypedArrayType(): Promise<typeof TypedArrayType>
```

## Returns

`typeof TypedArrayType`

Return value

## Implementation

```typescript
export enum TypedArrayType {
  Int8 = 1,
  Uint8 = 2,
  Uint8Clamped = 3,
  Int16 = 4,
  Uint16 = 5,
  Int32 = 6,
  Uint32 = 7,
  Float32 = 8,
  Float64 = 9,
  BigInt64 = 10,
  BigUint64 = 11,
}
```

## Dependencies

### Internal

#### `typeof TypedArrayType` (type)

**Description:** Return type
