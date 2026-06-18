# serviceResponses

> **HTTP:** `POST /api/serviceResponses` | **Type:** `async function serviceResponses(): Promise<{ readonly createRpcBinaryErrorResponse: (context: RpcFetchErrorContext) => Response; readonly jsonError: (status: number, message: string, type?: string) => Response; readonly notFoundJson: () => Response; }>` | **Location:** [`../../src/index.ts:177`](../../src/index.ts:177)

## Signature

```typescript
async function serviceResponses(): Promise<{ readonly createRpcBinaryErrorResponse: (context: RpcFetchErrorContext) => Response; readonly jsonError: (status: number, message: string, type?: string) => Response; readonly notFoundJson: () => Response; }>
```

## Returns

`{ readonly createRpcBinaryErrorResponse: (context: RpcFetchErrorContext) => Response; readonly jsonError: (status: number, message: string, type?: string) => Response; readonly notFoundJson: () => Response; }`

Return value

## Implementation

```typescript
{
		createRpcBinaryErrorResponse,
		jsonError,
		notFoundJson,
	}
```

## Dependencies

### Internal

#### `{ readonly createRpcBinaryErrorResponse: (context: RpcFetchErrorContext) => Response; readonly jsonError: (status: number, message: string, type?: string) => Response; readonly notFoundJson: () => Response; }` (type)

**Description:** Return type
