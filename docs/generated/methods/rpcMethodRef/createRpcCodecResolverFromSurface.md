# rpcMethodRef.createRpcCodecResolverFromSurface

> **HTTP:** `POST /api/rpcMethodRef/createRpcCodecResolverFromSurface` | **Type:** `async function rpcMethodRef.createRpcCodecResolverFromSurface(surface: unknown): Promise<RpcMethodCodecResolver>` | **Location:** [`../../src/index.ts:117`](../../src/index.ts:117)

## Signature

```typescript
async function rpcMethodRef.createRpcCodecResolverFromSurface(surface: unknown): Promise<RpcMethodCodecResolver>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `surface` | `unknown` | Yes | - |

## Returns

`RpcMethodCodecResolver`

Return value

## Implementation

```typescript
export function createRpcCodecResolverFromSurface(
  surface: unknown,
): RpcMethodCodecResolver {
  const registry = new Map<string, RpcMethodCodec<any[], any>>();

  const visit = (value: unknown): void => {
    if (typeof value === "function") {
      const methodName = getRpcMethodName(value);
      const codec = getRpcMethodCodec(value);
      if (methodName && codec) {
        registry.set(methodName, codec);
      }
      return;
    }

    if (!value || typeof value !== "object") {
      return;
    }

    for (const entry of Object.values(value as Record<string, unknown>)) {
      visit(entry);
    }
  };

  visit(surface);
  return (methodName: string) => registry.get(methodName);
}
```

## Dependencies

### Internal

#### `RpcMethodCodecResolver` (type)
> **Location:** [`../../src/rpc-method-ref.ts:125`](../../src/rpc-method-ref.ts:125)

```typescript
export type RpcMethodCodecResolver = (
  methodName: string,
) => RpcMethodCodec<any[], any> | undefined;
```

#### `RpcMethodCodec` (import)
> **Location:** [`../../src/rpc-method-ref.ts:5`](../../src/rpc-method-ref.ts:5)

```typescript
RpcMethodCodec
```

#### `getRpcMethodName` (function)
> **Location:** [`../../src/rpc-method-ref.ts:320`](../../src/rpc-method-ref.ts:320)

```typescript
export function getRpcMethodName(value: unknown): string | undefined {
  if (!value || (typeof value !== "object" && typeof value !== "function")) {
    return undefined;
  }

  const candidate = value as RpcMethodRefMetadata;
  const methodName = candidate.__nrpcMethodName;
  return typeof methodName === "string" && methodName.length > 0
    ? methodName
    : undefined;
}
```

#### `getRpcMethodCodec` (function)
> **Location:** [`../../src/rpc-method-ref.ts:332`](../../src/rpc-method-ref.ts:332)

```typescript
export function getRpcMethodCodec<Args extends any[] = any[], Result = any>(
  value: unknown,
): RpcMethodCodec<Args, Result> | undefined {
  if (!value || (typeof value !== "object" && typeof value !== "function")) {
    return undefined;
  }

  const candidate = value as RpcMethodRefMetadata;
  const codec = candidate[NRPC_METHOD_CODEC];
  return codec as RpcMethodCodec<Args, Result> | undefined;
}
```

#### `RpcMethodCodecResolver` (type)

**Description:** Return type
