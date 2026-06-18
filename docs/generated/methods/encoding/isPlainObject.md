# encoding.isPlainObject

> **HTTP:** `POST /api/encoding/isPlainObject` | **Type:** `async function encoding.isPlainObject(value: unknown): Promise<value is Record<string, unknown>>` | **Location:** [`../../src/index.ts:85`](../../src/index.ts:85)

## Signature

```typescript
async function encoding.isPlainObject(value: unknown): Promise<value is Record<string, unknown>>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `unknown` | Yes | - |

## Returns

`value is Record<string, unknown>`

Return value

## Implementation

```typescript
export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !isTypedArray(value)
  );
}
```

## Dependencies

### Internal

#### `isTypedArray` (function)
> **Location:** [`../../src/encoding.ts:3`](../../src/encoding.ts:3)

```typescript
export function isTypedArray(value: unknown): value is TypedArrayTypes {
  return (
    ArrayBuffer.isView(value) &&
    (value as { buffer?: unknown }).buffer instanceof ArrayBuffer
  );
}
```

#### `value is Record<string, unknown>` (type)

**Description:** Return type
