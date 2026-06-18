# encoding

> **HTTP:** `POST /api/encoding` | **Type:** `async function encoding(): Promise<{ readonly align8: (n: number) => number; readonly createTypedArray: (buffer: ArrayBufferLike, byteOffset: number, byteLength: number, arrayType: TypedArrayType) => TypedArrayTypes; readonly getTypedArrayType: (value: TypedArrayTypes) => TypedArrayType; readonly isPlainObject: (value: unknown) => value is Record<string, unknown>; readonly isTypedArray: (value: unknown) => value is TypedArrayTypes; readonly toUint8Array: (value: TypedArrayTypes) => Uint8Array<ArrayBufferLike>; }>` | **Location:** [`../../src/index.ts:81`](../../src/index.ts:81)

## Signature

```typescript
async function encoding(): Promise<{ readonly align8: (n: number) => number; readonly createTypedArray: (buffer: ArrayBufferLike, byteOffset: number, byteLength: number, arrayType: TypedArrayType) => TypedArrayTypes; readonly getTypedArrayType: (value: TypedArrayTypes) => TypedArrayType; readonly isPlainObject: (value: unknown) => value is Record<string, unknown>; readonly isTypedArray: (value: unknown) => value is TypedArrayTypes; readonly toUint8Array: (value: TypedArrayTypes) => Uint8Array<ArrayBufferLike>; }>
```

## Returns

`{ readonly align8: (n: number) => number; readonly createTypedArray: (buffer: ArrayBufferLike, byteOffset: number, byteLength: number, arrayType: TypedArrayType) => TypedArrayTypes; readonly getTypedArrayType: (value: TypedArrayTypes) => TypedArrayType; readonly isPlainObject: (value: unknown) => value is Record<string, unknown>; readonly isTypedArray: (value: unknown) => value is TypedArrayTypes; readonly toUint8Array: (value: TypedArrayTypes) => Uint8Array<ArrayBufferLike>; }`

Return value

## Implementation

```typescript
{
		align8,
		createTypedArray,
		getTypedArrayType,
		isPlainObject,
		isTypedArray,
		toUint8Array,
	}
```

## Dependencies

### Internal

#### `{ readonly align8: (n: number) => number; readonly createTypedArray: (buffer: ArrayBufferLike, byteOffset: number, byteLength: number, arrayType: TypedArrayType) => TypedArrayTypes; readonly getTypedArrayType: (value: TypedArrayTypes) => TypedArrayType; readonly isPlainObject: (value: unknown) => value is Record<string, unknown>; readonly isTypedArray: (value: unknown) => value is TypedArrayTypes; readonly toUint8Array: (value: TypedArrayTypes) => Uint8Array<ArrayBufferLike>; }` (type)

**Description:** Return type
