# encoding.isTypedArray

> **HTTP:** `POST /api/encoding/isTypedArray` | **Type:** `async function encoding.isTypedArray(value: unknown): Promise<value is TypedArrayTypes>` | **Location:** [`../../src/index.ts:86`](../../src/index.ts:86)

## Signature

```typescript
async function encoding.isTypedArray(value: unknown): Promise<value is TypedArrayTypes>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `unknown` | Yes | - |

## Returns

`value is TypedArrayTypes`

Return value

## Implementation

```typescript
export function isTypedArray(value: unknown): value is TypedArrayTypes {
  return (
    ArrayBuffer.isView(value) &&
    (value as { buffer?: unknown }).buffer instanceof ArrayBuffer
  );
}
```

## Dependencies

### Internal

#### `TypedArrayTypes` (import)
> **Location:** [`../../src/encoding.ts:1`](../../src/encoding.ts:1)

```typescript
TypedArrayTypes
```

#### `value is TypedArrayTypes` (type)

**Description:** Return type
