# valueCodec

> **HTTP:** `POST /api/valueCodec` | **Type:** `async function valueCodec(): Promise<{ readonly decodeRpcValue: (data: Uint8Array<ArrayBufferLike>, offset?: number) => [unknown, number]; readonly encodeRpcValue: (value: unknown) => Uint8Array<ArrayBufferLike>; }>` | **Location:** [`../../src/index.ts:89`](../../src/index.ts:89)

## Signature

```typescript
async function valueCodec(): Promise<{ readonly decodeRpcValue: (data: Uint8Array<ArrayBufferLike>, offset?: number) => [unknown, number]; readonly encodeRpcValue: (value: unknown) => Uint8Array<ArrayBufferLike>; }>
```

## Returns

`{ readonly decodeRpcValue: (data: Uint8Array<ArrayBufferLike>, offset?: number) => [unknown, number]; readonly encodeRpcValue: (value: unknown) => Uint8Array<ArrayBufferLike>; }`

Return value

## Implementation

```typescript
{
		decodeRpcValue,
		encodeRpcValue,
	}
```

## Dependencies

### Internal

#### `{ readonly decodeRpcValue: (data: Uint8Array<ArrayBufferLike>, offset?: number) => [unknown, number]; readonly encodeRpcValue: (value: unknown) => Uint8Array<ArrayBufferLike>; }` (type)

**Description:** Return type
