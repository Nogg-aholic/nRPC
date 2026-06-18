# serviceFetchHandler

> **HTTP:** `POST /api/serviceFetchHandler` | **Type:** `async function serviceFetchHandler(): Promise<{ readonly createServiceFetchHandler: <TService>(options: CreateServiceFetchHandlerOptions<TService>) => (request: Request) => Promise<Response>; }>` | **Location:** [`../../src/index.ts:185`](../../src/index.ts:185)

## Signature

```typescript
async function serviceFetchHandler(): Promise<{ readonly createServiceFetchHandler: <TService>(options: CreateServiceFetchHandlerOptions<TService>) => (request: Request) => Promise<Response>; }>
```

## Returns

`{ readonly createServiceFetchHandler: <TService>(options: CreateServiceFetchHandlerOptions<TService>) => (request: Request) => Promise<Response>; }`

Return value

## Implementation

```typescript
{
		createServiceFetchHandler,
	}
```

## Dependencies

### Internal

#### `{ readonly createServiceFetchHandler: <TService>(options: CreateServiceFetchHandlerOptions<TService>) => (request: Request) => Promise<Response>; }` (type)

**Description:** Return type
