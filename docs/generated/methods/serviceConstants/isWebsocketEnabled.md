# serviceConstants.isWebsocketEnabled

> **HTTP:** `POST /api/serviceConstants/isWebsocketEnabled` | **Type:** `async function serviceConstants.isWebsocketEnabled(value?: string | undefined): Promise<boolean>` | **Location:** [`../../src/index.ts:167`](../../src/index.ts:167)

## Signature

```typescript
async function serviceConstants.isWebsocketEnabled(value?: string | undefined): Promise<boolean>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string | undefined` | No | - |

## Returns

`boolean`

Return value

## Implementation

```typescript
(
  value = process.env.NRPC_ENABLE_WS,
): boolean =>
  ["1", "true", "yes", "on"].includes((value ?? "").trim().toLowerCase())
```

## Dependencies

### Internal

#### `boolean` (type)

**Description:** Return type
