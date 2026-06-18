# serviceWsDispatcher

> **HTTP:** `POST /api/serviceWsDispatcher` | **Type:** `async function serviceWsDispatcher(): Promise<{ readonly handleRpcWebSocketMessage: (ws: ServerWebSocket<unknown>, message: string | BufferSource, invokeMethod: RpcMethodInvoker) => Promise<void>; }>` | **Location:** [`../../src/index.ts:188`](../../src/index.ts:188)

## Signature

```typescript
async function serviceWsDispatcher(): Promise<{ readonly handleRpcWebSocketMessage: (ws: ServerWebSocket<unknown>, message: string | BufferSource, invokeMethod: RpcMethodInvoker) => Promise<void>; }>
```

## Returns

`{ readonly handleRpcWebSocketMessage: (ws: ServerWebSocket<unknown>, message: string | BufferSource, invokeMethod: RpcMethodInvoker) => Promise<void>; }`

Return value

## Implementation

```typescript
{
		handleRpcWebSocketMessage,
	}
```

## Dependencies

### Internal

#### `{ readonly handleRpcWebSocketMessage: (ws: ServerWebSocket<unknown>, message: string | BufferSource, invokeMethod: RpcMethodInvoker) => Promise<void>; }` (type)

**Description:** Return type
