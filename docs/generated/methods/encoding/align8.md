# encoding.align8

> **HTTP:** `POST /api/encoding/align8` | **Type:** `async function encoding.align8(n: number): Promise<number>` | **Location:** [`../../src/index.ts:82`](../../src/index.ts:82)

## Signature

```typescript
async function encoding.align8(n: number): Promise<number>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `n` | `number` | Yes | - |

## Returns

`number`

Return value

## Implementation

```typescript
export function align8(n: number): number {
  return (n + 7) & ~7;
}
```

## Dependencies

### Internal

#### `number` (type)

**Description:** Return type
