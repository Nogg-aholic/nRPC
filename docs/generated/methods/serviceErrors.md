# serviceErrors

> **HTTP:** `POST /api/serviceErrors` | **Type:** `async function serviceErrors(): Promise<{ readonly RpcServiceError: typeof RpcServiceError; readonly defaultTransformError: (error: unknown) => { message: string; }; readonly isRpcServiceError: (error: unknown) => error is RpcServiceError; }>` | **Location:** [`../../src/index.ts:169`](../../src/index.ts:169)

## Signature

```typescript
async function serviceErrors(): Promise<{ readonly RpcServiceError: typeof RpcServiceError; readonly defaultTransformError: (error: unknown) => { message: string; }; readonly isRpcServiceError: (error: unknown) => error is RpcServiceError; }>
```

## Returns

`{ readonly RpcServiceError: typeof RpcServiceError; readonly defaultTransformError: (error: unknown) => { message: string; }; readonly isRpcServiceError: (error: unknown) => error is RpcServiceError; }`

Return value

## Implementation

```typescript
{
		RpcServiceError,
		defaultTransformError,
		isRpcServiceError,
	}
```

## Dependencies

### Internal

#### `{ readonly RpcServiceError: typeof RpcServiceError; readonly defaultTransformError: (error: unknown) => { message: string; }; readonly isRpcServiceError: (error: unknown) => error is RpcServiceError; }` (type)

**Description:** Return type
