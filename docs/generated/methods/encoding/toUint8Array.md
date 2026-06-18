# encoding.toUint8Array

> **HTTP:** `POST /api/encoding/toUint8Array` | **Type:** `async function encoding.toUint8Array(value: TypedArrayTypes): Promise<Uint8Array>` | **Location:** [`../../src/index.ts:87`](../../src/index.ts:87)

## Signature

```typescript
async function encoding.toUint8Array(value: TypedArrayTypes): Promise<Uint8Array>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `TypedArrayTypes` | Yes | - |

## Returns

`Uint8Array`

Return value

## Implementation

```typescript
export function toUint8Array(value: TypedArrayTypes): Uint8Array {
  return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
}
```

## Dependencies

### Internal

#### `TypedArrayTypes` (import)
> **Location:** [`../../src/encoding.ts:1`](../../src/encoding.ts:1)

```typescript
TypedArrayTypes
```

#### `Uint8Array` (type)

**Description:** Return type
