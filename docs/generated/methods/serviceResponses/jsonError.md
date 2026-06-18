# serviceResponses.jsonError

> **HTTP:** `POST /api/serviceResponses/jsonError` | **Type:** `async function serviceResponses.jsonError(status: number, message: string, type?: string): Promise<Response>` | **Location:** [`../../src/index.ts:179`](../../src/index.ts:179)

## Signature

```typescript
async function serviceResponses.jsonError(status: number, message: string, type?: string): Promise<Response>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `status` | `number` | Yes | - |
| `message` | `string` | Yes | - |
| `type` | `string` | No | - |

## Returns

`Response`

Return value

## Implementation

```typescript
(
  status: number,
  message: string,
  type = "server_error",
): Response =>
  Response.json(
    {
      error: {
        message,
        type,
      },
    },
    { status },
  )
```

## Dependencies

### Internal

#### `Response` (type)

**Description:** Return type
