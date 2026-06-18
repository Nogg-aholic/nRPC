# upstreamProxyInjection.defineSyntheticRpcBinding

> **HTTP:** `POST /api/upstreamProxyInjection/defineSyntheticRpcBinding` | **Type:** `async function upstreamProxyInjection.defineSyntheticRpcBinding(binding: SyntheticRpcBinding): Promise<SyntheticRpcBinding>` | **Location:** [`../../src/index.ts:161`](../../src/index.ts:161)

## Signature

```typescript
async function upstreamProxyInjection.defineSyntheticRpcBinding(binding: SyntheticRpcBinding): Promise<SyntheticRpcBinding>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `binding` | `SyntheticRpcBinding` | Yes | - |

## Returns

`SyntheticRpcBinding`

Return value

## Implementation

```typescript
export function defineSyntheticRpcBinding(
  binding: SyntheticRpcBinding,
): SyntheticRpcBinding {
  return binding;
}
```

## Dependencies

### Internal

#### `SyntheticRpcBinding` (type)
> **Location:** [`../../src/synthetic-rpc-surface.ts:1`](../../src/synthetic-rpc-surface.ts:1)

```typescript
export type SyntheticRpcBinding = {
  name: string;
  declarationLines: string[];
  runtimeExpression: string;
  marker?: string;
};
```

#### `SyntheticRpcBinding` (type)

**Description:** Return type
