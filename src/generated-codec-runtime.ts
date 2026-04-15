import { createTypedArray, getTypedArrayType, toUint8Array } from './encoding.js';
import { TypedArrayType, type TypedArrayTypes } from './types.js';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

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
		const { written = 0 } = textEncoder.encodeInto(value, this.buffer.subarray(writeStart));
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

export class GeneratedCodecReader {
	private readonly view: DataView;
	offset: number;

	constructor(private readonly buffer: Uint8Array, offset = 0) {
		this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
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
		for (let index = 0; index < count; index += 1) values[index] = this.readString();
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
		for (let index = 0; index < count; index += 1) values[index] = this.readU32();
		return values;
	}

	readI32Array(): number[] {
		const count = this.readU32();
		const values = new Array<number>(count);
		for (let index = 0; index < count; index += 1) values[index] = this.readI32();
		return values;
	}

	readNumberArray(): number[] {
		const count = this.readU32();
		const values = new Array<number>(count);
		for (let index = 0; index < count; index += 1) values[index] = this.readF64();
		return values;
	}

	readBooleanArray(): boolean[] {
		const count = this.readU32();
		const values = new Array<boolean>(count);
		for (let index = 0; index < count; index += 1) values[index] = this.readBool();
		return values;
	}

	readTypedArray(): TypedArrayTypes {
		const arrayType = this.readU8() as TypedArrayType;
		const byteLength = this.readU32();
		const start = this.offset;
		const end = start + byteLength;
		this.offset = end;
		return createTypedArray(this.buffer.buffer, this.buffer.byteOffset + start, byteLength, arrayType);
	}
}