# generatedCodecRuntime.GeneratedCodecWriter

> **HTTP:** `POST /api/generatedCodecRuntime/GeneratedCodecWriter` | **Type:** `async function generatedCodecRuntime.GeneratedCodecWriter(): Promise<typeof GeneratedCodecWriter>` | **Location:** [`../../src/index.ts:129`](../../src/index.ts:129)

## Signature

```typescript
async function generatedCodecRuntime.GeneratedCodecWriter(): Promise<typeof GeneratedCodecWriter>
```

## Returns

`typeof GeneratedCodecWriter`

Return value

## Implementation

```typescript
export class GeneratedCodecWriter {
  private buffer: Uint8Array;
  private view: DataView;
  offset = 0;

  constructor(initialCapacity = 1024) {
    this.buffer = new Uint8Array(initialCapacity);
    this.view = new DataView(this.buffer.buffer);
  }

  private ensureCapacity(extra: number): void {
    const required = this.offset + extra;
    if (required <= this.buffer.byteLength) return;
    let nextCapacity = this.buffer.byteLength;
    while (nextCapacity < required) nextCapacity *= 2;
    const next = new Uint8Array(nextCapacity);
    next.set(this.buffer);
    this.buffer = next;
    this.view = new DataView(this.buffer.buffer);
  }

  writeU8(value: number): void {
    this.ensureCapacity(1);
    this.buffer[this.offset++] = value & 0xff;
  }

  writeBool(value: boolean): void {
    this.writeU8(value ? 1 : 0);
  }

  writeU32(value: number): void {
    this.ensureCapacity(4);
    this.view.setUint32(this.offset, value >>> 0, true);
    this.offset += 4;
  }

  writeI32(value: number): void {
    this.ensureCapacity(4);
    this.view.setInt32(this.offset, value | 0, true);
    this.offset += 4;
  }

  writeF64(value: number): void {
    this.ensureCapacity(8);
    this.view.setFloat64(this.offset, value, true);
    this.offset += 8;
  }

  writeBigInt64(value: bigint): void {
    this.ensureCapacity(8);
    this.view.setBigInt64(this.offset, value, true);
    this.offset += 8;
  }

  writeString(value: string): void {
    const maxBytes = value.length * 3;
    this.ensureCapacity(4 + maxBytes);
    const writeStart = this.offset + 4;
    const { written = 0 } = textEncoder.encodeInto(
      value,
      this.buffer.subarray(writeStart),
    );
    this.view.setUint32(this.offset, written, true);
    this.offset = writeStart + written;
  }

  writeStringArray(values: string[]): void {
    this.writeU32(values.length);
    for (const value of values) this.writeString(value);
  }

  writeOptionalMarker(hasValue: boolean): void {
    this.writeBool(hasValue);
  }

  writeVariantIndex(index: number): void {
    this.writeU8(index);
  }

  writeU32Array(values: number[]): void {
    this.writeU32(values.length);
    for (const value of values) this.writeU32(value);
  }

  writeI32Array(values: number[]): void {
    this.writeU32(values.length);
    for (const value of values) this.writeI32(value);
  }

  writeNumberArray(values: number[]): void {
    this.writeU32(values.length);
    for (const value of values) this.writeF64(value);
  }

  writeBooleanArray(values: boolean[]): void {
    this.writeU32(values.length);
    for (const value of values) this.writeBool(value);
  }

  writeTypedArray(value: TypedArrayTypes): void {
    const bytes = toUint8Array(value);
    this.writeU8(getTypedArrayType(value));
    this.writeU32(bytes.byteLength);
    this.ensureCapacity(bytes.byteLength);
    this.buffer.set(bytes, this.offset);
    this.offset += bytes.byteLength;
  }

  finish(): Uint8Array {
    return this.buffer.slice(0, this.offset);
  }
}
```

## Dependencies

### Internal

#### `textEncoder` (variable)
> **Location:** [`../../src/generated-codec-runtime.ts:71`](../../src/generated-codec-runtime.ts:71)

```typescript
textEncoder = new TextEncoder()
```

#### `TypedArrayTypes` (import)
> **Location:** [`../../src/generated-codec-runtime.ts:10`](../../src/generated-codec-runtime.ts:10)

```typescript
TypedArrayTypes
```

#### `toUint8Array` (import)
> **Location:** [`../../src/generated-codec-runtime.ts:4`](../../src/generated-codec-runtime.ts:4)

```typescript
toUint8Array
```

#### `getTypedArrayType` (import)
> **Location:** [`../../src/generated-codec-runtime.ts:3`](../../src/generated-codec-runtime.ts:3)

```typescript
getTypedArrayType
```

#### `typeof GeneratedCodecWriter` (type)

**Description:** Return type
