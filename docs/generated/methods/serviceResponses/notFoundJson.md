# serviceResponses.notFoundJson

> **HTTP:** `POST /api/serviceResponses/notFoundJson` | **Type:** `async function serviceResponses.notFoundJson(): Promise<Response>` | **Location:** [`../../src/index.ts:180`](../../src/index.ts:180)

## Signature

```typescript
async function serviceResponses.notFoundJson(): Promise<Response>
```

## Returns

`Response`

Return value

## Implementation

```typescript
(): Response =>
  jsonError(404, "Route not found", "not_found")
```

## Dependencies

### Internal

#### `jsonError` (variable)
> **Location:** [`../../src/service-responses.ts:10`](../../src/service-responses.ts:10)

```typescript
jsonError = (
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

#### `Response` (type)

**Description:** Return type
