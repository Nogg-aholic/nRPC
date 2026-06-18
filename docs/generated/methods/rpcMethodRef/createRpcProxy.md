# rpcMethodRef.createRpcProxy

> **HTTP:** `POST /api/rpcMethodRef/createRpcProxy` | **Type:** `async function rpcMethodRef.createRpcProxy(pathParts?: string[]): Promise<Rpcify<T>>` | **Location:** [`../../src/index.ts:118`](../../src/index.ts:118)

## Signature

```typescript
async function rpcMethodRef.createRpcProxy(pathParts?: string[]): Promise<Rpcify<T>>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `pathParts` | `string[]` | No | - |

## Returns

`Rpcify<T>`

Return value

## Implementation

```typescript
export function createRpcProxy<T>(pathParts: string[] = []): Rpcify<T> {
  const cache = new Map<string, unknown>();

  const build = (parts: string[]): unknown => {
    const cacheKey = parts.join(".");
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const proxy = new Proxy(function () {}, {
      get(_target, property) {
        if (property === "__nrpcMethodName") {
          return cacheKey;
        }
        if (property === NRPC_METHOD_REF) {
          return true;
        }
        if (property === "then" && cacheKey.length === 0) {
          return undefined;
        }
        if (typeof property === "symbol") {
          return undefined;
        }
        return build([...parts, String(property)]);
      },
      apply() {
        throw new Error(
          `RPC reference ${cacheKey || "<root>"} cannot be invoked directly. Resolve it through your RPC caller.`,
        );
      },
    });

    cache.set(cacheKey, proxy);
    return proxy;
  };

  return build(pathParts) as Rpcify<T>;
}
```

## Dependencies

### Internal

#### `Rpcify` (type)
> **Location:** [`../../src/rpc-method-ref.ts:48`](../../src/rpc-method-ref.ts:48)

```typescript
export type Rpcify<T> = T extends (...args: infer A) => infer R
  ? RpcMethodRef<A, R>
  : T extends object
    ? {
        [K in keyof T as K extends RpcPromiseLikeKeys ? never : K]: Rpcify<
          T[K]
        >;
      }
    : T;
```

#### `NRPC_METHOD_REF` (variable)
> **Location:** [`../../src/rpc-method-ref.ts:1`](../../src/rpc-method-ref.ts:1)

```typescript
NRPC_METHOD_REF = Symbol.for("@nogg-aholic/nrpc/method-ref")
```

#### `Rpcify<T>` (type)

**Description:** Return type
