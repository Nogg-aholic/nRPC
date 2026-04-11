import { TypedArrayType, type TypedArrayTypes } from './types.js';

export function isTypedArray(value: unknown): value is TypedArrayTypes {
  return ArrayBuffer.isView(value) && (value as { buffer?: unknown }).buffer instanceof ArrayBuffer;
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && !isTypedArray(value);
}

export function align8(n: number): number {
  return (n + 7) & ~7;
}

export function getTypedArrayType(value: TypedArrayTypes): TypedArrayType {
  if (value instanceof Int8Array) return TypedArrayType.Int8;
  if (value instanceof Uint8Array) return TypedArrayType.Uint8;
  if (value instanceof Uint8ClampedArray) return TypedArrayType.Uint8Clamped;
  if (value instanceof Int16Array) return TypedArrayType.Int16;
  if (value instanceof Uint16Array) return TypedArrayType.Uint16;
  if (value instanceof Int32Array) return TypedArrayType.Int32;
  if (value instanceof Uint32Array) return TypedArrayType.Uint32;
  if (value instanceof Float32Array) return TypedArrayType.Float32;
  if (value instanceof Float64Array) return TypedArrayType.Float64;
  if (value instanceof BigInt64Array) return TypedArrayType.BigInt64;
  if (value instanceof BigUint64Array) return TypedArrayType.BigUint64;
  throw new Error('Unsupported typed array.');
}

export function toUint8Array(value: TypedArrayTypes): Uint8Array {
  return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
}

export function createTypedArray(
  buffer: ArrayBufferLike,
  byteOffset: number,
  byteLength: number,
  arrayType: TypedArrayType,
): TypedArrayTypes {
  switch (arrayType) {
    case TypedArrayType.Int8:
      return new Int8Array(buffer, byteOffset, byteLength);
    case TypedArrayType.Uint8:
      return new Uint8Array(buffer, byteOffset, byteLength);
    case TypedArrayType.Uint8Clamped:
      return new Uint8ClampedArray(buffer, byteOffset, byteLength);
    case TypedArrayType.Int16:
      return new Int16Array(buffer, byteOffset, byteLength / Int16Array.BYTES_PER_ELEMENT);
    case TypedArrayType.Uint16:
      return new Uint16Array(buffer, byteOffset, byteLength / Uint16Array.BYTES_PER_ELEMENT);
    case TypedArrayType.Int32:
      return new Int32Array(buffer, byteOffset, byteLength / Int32Array.BYTES_PER_ELEMENT);
    case TypedArrayType.Uint32:
      return new Uint32Array(buffer, byteOffset, byteLength / Uint32Array.BYTES_PER_ELEMENT);
    case TypedArrayType.Float32:
      return new Float32Array(buffer, byteOffset, byteLength / Float32Array.BYTES_PER_ELEMENT);
    case TypedArrayType.Float64:
      return new Float64Array(buffer, byteOffset, byteLength / Float64Array.BYTES_PER_ELEMENT);
    case TypedArrayType.BigInt64:
      return new BigInt64Array(buffer, byteOffset, byteLength / BigInt64Array.BYTES_PER_ELEMENT);
    case TypedArrayType.BigUint64:
      return new BigUint64Array(buffer, byteOffset, byteLength / BigUint64Array.BYTES_PER_ELEMENT);
    default:
      throw new Error(`Unknown typed array type: ${arrayType}`);
  }
}
