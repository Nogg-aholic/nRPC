# types.RpcArgTag.Array.toPrecision

> **HTTP:** `POST /api/types/RpcArgTag/Array/toPrecision` | **Type:** `async function types.RpcArgTag.Array.toPrecision(precision?: number): Promise<string>` | **Location:** [`../../../nrpc-cli/node_modules/typescript/lib/lib.es5.d.ts:580`](../../../nrpc-cli/node_modules/typescript/lib/lib.es5.d.ts:580)

## Description

Returns a string containing a number represented either in exponential or fixed-point notation with a specified number of digits.

## Signature

```typescript
async function types.RpcArgTag.Array.toPrecision(precision?: number): Promise<string>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `precision` | `number` | No | - |

## Returns

`string`

Return value

## Implementation

```typescript
toPrecision(precision?: number): string;
```

## Dependencies

### Internal

#### `string` (type)

**Description:** Return type
