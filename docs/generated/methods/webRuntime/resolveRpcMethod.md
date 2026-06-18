# webRuntime.resolveRpcMethod

> **HTTP:** `POST /api/webRuntime/resolveRpcMethod` | **Type:** `async function webRuntime.resolveRpcMethod(target: unknown, methodName: string, options?: ResolveRpcMethodOptions): Promise<(...args: any[]) => unknown>` | **Location:** [`../../src/index.ts:146`](../../src/index.ts:146)

## Signature

```typescript
async function webRuntime.resolveRpcMethod(target: unknown, methodName: string, options?: ResolveRpcMethodOptions): Promise<(...args: any[]) => unknown>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `target` | `unknown` | Yes | - |
| `methodName` | `string` | Yes | - |
| `options` | `ResolveRpcMethodOptions` | No | - |

## Returns

`(...args: any[]) => unknown`

Return value

## Implementation

```typescript
export function resolveRpcMethod(
  target: unknown,
  methodName: string,
  options: ResolveRpcMethodOptions = {},
): (...args: any[]) => unknown {
  const separator = options.separator ?? ".";
  const path = methodName
    .split(separator)
    .filter((segment) =>
      options.allowEmptySegments ? true : segment.length > 0,
    );
  let cursor: unknown = target;
  for (const part of path) {
    cursor = (cursor as Record<string, unknown> | undefined)?.[part];
  }
  if (typeof cursor !== "function") {
    throw new Error(`Unknown RPC method: ${methodName}`);
  }
  return cursor as (...args: any[]) => unknown;
}
```

## Dependencies

### Internal

#### `ResolveRpcMethodOptions` (type)
> **Location:** [`../../src/web-runtime.ts:39`](../../src/web-runtime.ts:39)

```typescript
export type ResolveRpcMethodOptions = {
  separator?: string;
  allowEmptySegments?: boolean;
};
```

#### `(...args: any[]) => unknown` (type)

**Description:** Return type
