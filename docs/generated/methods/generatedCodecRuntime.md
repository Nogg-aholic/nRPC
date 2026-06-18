# generatedCodecRuntime

> **HTTP:** `POST /api/generatedCodecRuntime` | **Type:** `async function generatedCodecRuntime(): Promise<{ readonly GeneratedCodecReader: typeof GeneratedCodecReader; readonly GeneratedCodecWriter: typeof GeneratedCodecWriter; readonly createGeneratedPayloadCodec: <T>(shape: GeneratedCodecShape) => RpcPayloadCodec<T>; readonly createGeneratedRpcMethodCodec: <TArgs extends any[] = any[], TResult = any>(argsShape: GeneratedCodecShape, resultShape: GeneratedCodecShape) => RpcMethodCodec<TArgs, TResult>; }>` | **Location:** [`../../src/index.ts:127`](../../src/index.ts:127)

## Signature

```typescript
async function generatedCodecRuntime(): Promise<{ readonly GeneratedCodecReader: typeof GeneratedCodecReader; readonly GeneratedCodecWriter: typeof GeneratedCodecWriter; readonly createGeneratedPayloadCodec: <T>(shape: GeneratedCodecShape) => RpcPayloadCodec<T>; readonly createGeneratedRpcMethodCodec: <TArgs extends any[] = any[], TResult = any>(argsShape: GeneratedCodecShape, resultShape: GeneratedCodecShape) => RpcMethodCodec<TArgs, TResult>; }>
```

## Returns

`{ readonly GeneratedCodecReader: typeof GeneratedCodecReader; readonly GeneratedCodecWriter: typeof GeneratedCodecWriter; readonly createGeneratedPayloadCodec: <T>(shape: GeneratedCodecShape) => RpcPayloadCodec<T>; readonly createGeneratedRpcMethodCodec: <TArgs extends any[] = any[], TResult = any>(argsShape: GeneratedCodecShape, resultShape: GeneratedCodecShape) => RpcMethodCodec<TArgs, TResult>; }`

Return value

## Implementation

```typescript
{
		GeneratedCodecReader,
		GeneratedCodecWriter,
		createGeneratedPayloadCodec,
		createGeneratedRpcMethodCodec,
	}
```

## Dependencies

### Internal

#### `{ readonly GeneratedCodecReader: typeof GeneratedCodecReader; readonly GeneratedCodecWriter: typeof GeneratedCodecWriter; readonly createGeneratedPayloadCodec: <T>(shape: GeneratedCodecShape) => RpcPayloadCodec<T>; readonly createGeneratedRpcMethodCodec: <TArgs extends any[] = any[], TResult = any>(argsShape: GeneratedCodecShape, resultShape: GeneratedCodecShape) => RpcMethodCodec<TArgs, TResult>; }` (type)

**Description:** Return type
