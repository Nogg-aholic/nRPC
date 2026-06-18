# webRuntime.createRpcMethodInvoker

> **HTTP:** `POST /api/webRuntime/createRpcMethodInvoker` | **Type:** `async function webRuntime.createRpcMethodInvoker(target: unknown, options?: ResolveRpcMethodOptions): Promise<RpcMethodInvoker>` | **Location:** [`../../src/index.ts:142`](../../src/index.ts:142)

## Signature

```typescript
async function webRuntime.createRpcMethodInvoker(target: unknown, options?: ResolveRpcMethodOptions): Promise<RpcMethodInvoker>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `target` | `unknown` | Yes | - |
| `options` | `ResolveRpcMethodOptions` | No | - |

## Returns

`RpcMethodInvoker`

Return value

## Implementation

```typescript
export function createRpcMethodInvoker(
  target: unknown,
  options?: ResolveRpcMethodOptions,
): RpcMethodInvoker {
  return async (methodName, args) => {
    const method = resolveRpcMethod(target, methodName, options);
    return method(...args);
  };
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

#### `RpcMethodInvoker` (type)
> **Location:** [`../../src/web-runtime.ts:34`](../../src/web-runtime.ts:34)

```typescript
export type RpcMethodInvoker = (
  methodName: string,
  args: readonly unknown[],
) => unknown | Promise<unknown>;
```

#### `resolveRpcMethod` (function)
> **Location:** [`../../src/web-runtime.ts:204`](../../src/web-runtime.ts:204)

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

#### `RpcMethodInvoker` (type)

**Description:** Return type
