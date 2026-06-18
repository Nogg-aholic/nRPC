# generatedCodecRuntime.createGeneratedRpcMethodCodec

> **HTTP:** `POST /api/generatedCodecRuntime/createGeneratedRpcMethodCodec` | **Type:** `async function generatedCodecRuntime.createGeneratedRpcMethodCodec(argsShape: GeneratedCodecShape, resultShape: GeneratedCodecShape): Promise<RpcMethodCodec<TArgs, TResult>>` | **Location:** [`../../src/index.ts:131`](../../src/index.ts:131)

## Signature

```typescript
async function generatedCodecRuntime.createGeneratedRpcMethodCodec(argsShape: GeneratedCodecShape, resultShape: GeneratedCodecShape): Promise<RpcMethodCodec<TArgs, TResult>>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `argsShape` | `GeneratedCodecShape` | Yes | - |
| `resultShape` | `GeneratedCodecShape` | Yes | - |

## Returns

`RpcMethodCodec<TArgs, TResult>`

Return value

## Implementation

```typescript
export function createGeneratedRpcMethodCodec<
  TArgs extends any[] = any[],
  TResult = any,
>(
  argsShape: GeneratedCodecShape,
  resultShape: GeneratedCodecShape,
): RpcMethodCodec<TArgs, TResult> {
  return {
    args: createGeneratedPayloadCodec<TArgs>(argsShape),
    result: createGeneratedPayloadCodec<Awaited<TResult>>(resultShape),
  };
}
```

## Dependencies

### Internal

#### `GeneratedCodecShape` (type)
> **Location:** [`../../src/generated-codec-runtime.ts:29`](../../src/generated-codec-runtime.ts:29)

```typescript
export type GeneratedCodecShape =
  | {
      kind: "primitive";
      primitive: GeneratedCodecPrimitiveKind;
      numericKind?: GeneratedCodecNumericKind;
    }
  | { kind: "bigint" }
  | { kind: "unknown" }
  | { kind: "null" }
  | { kind: "literal"; value: GeneratedCodecLiteral }
  | { kind: "undefined" }
  | { kind: "optional"; inner: GeneratedCodecShape }
  | { kind: "date"; policy: "iso-string" | "epoch-ms" }
  | {
      kind: "map";
      key: GeneratedCodecShape;
      value: GeneratedCodecShape;
      policy: "entries" | "object";
    }
  | { kind: "record"; value: GeneratedCodecShape }
  | { kind: "set"; element: GeneratedCodecShape; policy: "array" }
  | { kind: "union"; variants: ReadonlyArray<GeneratedCodecShape> }
  | {
      kind: "discriminated-union";
      discriminator: string;
      variants: ReadonlyArray<{
        tagValue: GeneratedCodecLiteral;
        shape: Extract<GeneratedCodecShape, { kind: "object" }>;
      }>;
    }
  | { kind: "typed-array"; arrayType: GeneratedCodecTypedArrayKind }
  | { kind: "array"; element: GeneratedCodecShape }
  | { kind: "tuple"; elements: ReadonlyArray<GeneratedCodecShape> }
  | {
      kind: "object";
      properties: ReadonlyArray<{
        name: string;
        shape: GeneratedCodecShape;
        description?: string;
      }>;
    };
```

#### `RpcMethodCodec` (import)
> **Location:** [`../../src/generated-codec-runtime.ts:8`](../../src/generated-codec-runtime.ts:8)

```typescript
RpcMethodCodec
```

#### `createGeneratedPayloadCodec` (function)
> **Location:** [`../../src/generated-codec-runtime.ts:466`](../../src/generated-codec-runtime.ts:466)

```typescript
export function createGeneratedPayloadCodec<T>(
  shape: GeneratedCodecShape,
): RpcPayloadCodec<T> {
  return {
    encode(value) {
      const writer = new GeneratedCodecWriter();
      writeGeneratedCodecShape(writer, shape, value);
      return writer.finish();
    },
    decode(data, offset = 0) {
      const reader = new GeneratedCodecReader(data, offset);
      return [readGeneratedCodecShape(reader, shape) as T, reader.offset];
    },
  };
}
```

#### `RpcMethodCodec<TArgs, TResult>` (type)

**Description:** Return type
