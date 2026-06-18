# generatedCodecRuntime.GeneratedCodecReader

> **HTTP:** `POST /api/generatedCodecRuntime/GeneratedCodecReader` | **Type:** `async function generatedCodecRuntime.GeneratedCodecReader(): Promise<typeof GeneratedCodecReader>` | **Location:** [`../../src/index.ts:128`](../../src/index.ts:128)

## Signature

```typescript
async function generatedCodecRuntime.GeneratedCodecReader(): Promise<typeof GeneratedCodecReader>
```

## Returns

`typeof GeneratedCodecReader`

Return value

## Implementation

```typescript
export class GeneratedCodecReader {
  private readonly view: DataView;
  offset: number;

  constructor(
    private readonly buffer: Uint8Array,
    offset = 0,
  ) {
    this.view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength,
    );
    this.offset = offset;
  }

  readU8(): number {
    return this.buffer[this.offset++] ?? 0;
  }

  readBool(): boolean {
    return this.readU8() === 1;
  }

  readU32(): number {
    const value = this.view.getUint32(this.offset, true);
    this.offset += 4;
    return value;
  }

  readI32(): number {
    const value = this.view.getInt32(this.offset, true);
    this.offset += 4;
    return value;
  }

  readF64(): number {
    const value = this.view.getFloat64(this.offset, true);
    this.offset += 8;
    return value;
  }

  readBigInt64(): bigint {
    const value = this.view.getBigInt64(this.offset, true);
    this.offset += 8;
    return value;
  }

  readString(): string {
    const byteLength = this.readU32();
    const start = this.offset;
    const end = start + byteLength;
    this.offset = end;
    return textDecoder.decode(this.buffer.subarray(start, end));
  }

  readStringArray(): string[] {
    const count = this.readU32();
    const values = new Array<string>(count);
    for (let index = 0; index < count; index += 1)
      values[index] = this.readString();
    return values;
  }

  readOptionalMarker(): boolean {
    return this.readBool();
  }

  readVariantIndex(): number {
    return this.readU8();
  }

  readU32Array(): number[] {
    const count = this.readU32();
    const values = new Array<number>(count);
    for (let index = 0; index < count; index += 1)
      values[index] = this.readU32();
    return values;
  }

  readI32Array(): number[] {
    const count = this.readU32();
    const values = new Array<number>(count);
    for (let index = 0; index < count; index += 1)
      values[index] = this.readI32();
    return values;
  }

  readNumberArray(): number[] {
    const count = this.readU32();
    const values = new Array<number>(count);
    for (let index = 0; index < count; index += 1)
      values[index] = this.readF64();
    return values;
  }

  readBooleanArray(): boolean[] {
    const count = this.readU32();
    const values = new Array<boolean>(count);
    for (let index = 0; index < count; index += 1)
      values[index] = this.readBool();
    return values;
  }

  readTypedArray(): TypedArrayTypes {
    const arrayType = this.readU8() as TypedArrayType;
    const byteLength = this.readU32();
    const start = this.offset;
    const end = start + byteLength;
    this.offset = end;
    return createTypedArray(
      this.buffer.buffer,
      this.buffer.byteOffset + start,
      byteLength,
      arrayType,
    );
  }
}
```

## Dependencies

### Internal

#### `textDecoder` (variable)
> **Location:** [`../../src/generated-codec-runtime.ts:72`](../../src/generated-codec-runtime.ts:72)

```typescript
textDecoder = new TextDecoder()
```

#### `TypedArrayTypes` (import)
> **Location:** [`../../src/generated-codec-runtime.ts:10`](../../src/generated-codec-runtime.ts:10)

```typescript
TypedArrayTypes
```

#### `TypedArrayType` (import)
> **Location:** [`../../src/generated-codec-runtime.ts:7`](../../src/generated-codec-runtime.ts:7)

```typescript
TypedArrayType
```

#### `createTypedArray` (import)
> **Location:** [`../../src/generated-codec-runtime.ts:2`](../../src/generated-codec-runtime.ts:2)

```typescript
createTypedArray
```

#### `typeof GeneratedCodecReader` (type)

**Description:** Return type
