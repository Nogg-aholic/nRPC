# serviceErrors.defaultTransformError

> **HTTP:** `POST /api/serviceErrors/defaultTransformError` | **Type:** `async function serviceErrors.defaultTransformError(error: unknown): Promise<{ message: string; }>` | **Location:** [`../../src/index.ts:171`](../../src/index.ts:171)

## Signature

```typescript
async function serviceErrors.defaultTransformError(error: unknown): Promise<{ message: string; }>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `error` | `unknown` | Yes | - |

## Returns

`{ message: string; }`

Return value

## Implementation

```typescript
(error: unknown) => ({
  message: error instanceof Error ? error.message : "rpc_error",
})
```

## Dependencies

### Internal

#### `{ message: string; }` (type)

**Description:** Return type
