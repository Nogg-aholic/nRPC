# serviceErrors.isRpcServiceError

> **HTTP:** `POST /api/serviceErrors/isRpcServiceError` | **Type:** `async function serviceErrors.isRpcServiceError(error: unknown): Promise<error is RpcServiceError>` | **Location:** [`../../src/index.ts:172`](../../src/index.ts:172)

## Signature

```typescript
async function serviceErrors.isRpcServiceError(error: unknown): Promise<error is RpcServiceError>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `error` | `unknown` | Yes | - |

## Returns

`error is RpcServiceError`

Return value

## Implementation

```typescript
(error: unknown): error is RpcServiceError =>
  error instanceof RpcServiceError
```

## Dependencies

### Internal

#### `RpcServiceError` (class)
> **Location:** [`../../src/service-errors.ts:1`](../../src/service-errors.ts:1)

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

#### `error is RpcServiceError` (type)

**Description:** Return type
