# types.TypedArrayType.Int32.toLocaleString

> **HTTP:** `POST /api/types/TypedArrayType/Int32/toLocaleString` | **Type:** `async function types.TypedArrayType.Int32.toLocaleString(locales?: string | string[], options?: Intl.NumberFormatOptions): Promise<string>` | **Location:** [`../../../nrpc-cli/node_modules/typescript/lib/lib.es5.d.ts:4576`](../../../nrpc-cli/node_modules/typescript/lib/lib.es5.d.ts:4576)

## Description

Converts a number to a string by using the current or specified locale.

## Signature

```typescript
async function types.TypedArrayType.Int32.toLocaleString(locales?: string | string[], options?: Intl.NumberFormatOptions): Promise<string>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `locales` | `string | string[]` | No | - |
| `options` | `Intl.NumberFormatOptions` | No | - |

## Returns

`string`

Return value

## Implementation

```typescript
toLocaleString(locales?: string | string[], options?: Intl.NumberFormatOptions): string;
```

## Dependencies

### Internal

#### `string` (type)

**Description:** Return type
