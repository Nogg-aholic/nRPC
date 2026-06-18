# types.TypedArrayType.Float64.toFixed

> **HTTP:** `POST /api/types/TypedArrayType/Float64/toFixed` | **Type:** `async function types.TypedArrayType.Float64.toFixed(fractionDigits?: number): Promise<string>` | **Location:** [`../../../nrpc-cli/node_modules/typescript/lib/lib.es5.d.ts:568`](../../../nrpc-cli/node_modules/typescript/lib/lib.es5.d.ts:568)

## Description

Returns a string representing a number in fixed-point notation.

## Signature

```typescript
async function types.TypedArrayType.Float64.toFixed(fractionDigits?: number): Promise<string>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `fractionDigits` | `number` | No | - |

## Returns

`string`

Return value

## Implementation

```typescript
toFixed(fractionDigits?: number): string;
```

## Dependencies

### Internal

#### `string` (type)

**Description:** Return type
