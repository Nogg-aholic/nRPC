# serviceErrors.RpcServiceError

> **HTTP:** `POST /api/serviceErrors/RpcServiceError` | **Type:** `async function serviceErrors.RpcServiceError(): Promise<typeof RpcServiceError>` | **Location:** [`../../src/index.ts:170`](../../src/index.ts:170)

## Signature

```typescript
async function serviceErrors.RpcServiceError(): Promise<typeof RpcServiceError>
```

## Returns

`typeof RpcServiceError`

Return value

## Implementation

```typescript
export class RpcServiceError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "RpcServiceError";
  }
}
```

## Dependencies

### Internal

#### `typeof RpcServiceError` (type)

**Description:** Return type
