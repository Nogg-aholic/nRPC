import { createTypedArray, getTypedArrayType, toUint8Array } from './encoding.js';
import { TypedArrayType, type RpcMethodCodec, type RpcPayloadCodec, type TypedArrayTypes } from './types.js';

type GeneratedCodecLiteral = string | number | boolean;
type GeneratedCodecNumericKind = 'f64' | 'u32' | 'i32';
type GeneratedCodecPrimitiveKind = 'string' | 'number' | 'boolean';
type GeneratedCodecTypedArrayKind =
	| 'Int8Array'
	| 'Uint8Array'
	| 'Uint8ClampedArray'
	| 'Int16Array'
	| 'Uint16Array'
	| 'Int32Array'
	| 'Uint32Array'
	| 'Float32Array'
	| 'Float64Array'
	| 'BigInt64Array'
	| 'BigUint64Array';

export type GeneratedCodecShape =
	| { kind: 'primitive'; primitive: GeneratedCodecPrimitiveKind; numericKind?: GeneratedCodecNumericKind }
	| { kind: 'bigint' }
	| { kind: 'unknown' }
	| { kind: 'null' }
	| { kind: 'literal'; value: GeneratedCodecLiteral }
	| { kind: 'undefined' }
	| { kind: 'optional'; inner: GeneratedCodecShape }
	| { kind: 'date'; policy: 'iso-string' | 'epoch-ms' }
	| { kind: 'map'; key: GeneratedCodecShape; value: GeneratedCodecShape; policy: 'entries' | 'object' }
	| { kind: 'record'; value: GeneratedCodecShape }
	| { kind: 'set'; element: GeneratedCodecShape; policy: 'array' }
	| { kind: 'union'; variants: ReadonlyArray<GeneratedCodecShape> }
	| {
			kind: 'discriminated-union';
			discriminator: string;
			variants: ReadonlyArray<{ tagValue: GeneratedCodecLiteral; shape: Extract<GeneratedCodecShape, { kind: 'object' }> }>;
	  }
	| { kind: 'typed-array'; arrayType: GeneratedCodecTypedArrayKind }
	| { kind: 'array'; element: GeneratedCodecShape }
	| { kind: 'tuple'; elements: ReadonlyArray<GeneratedCodecShape> }
	| { kind: 'object'; properties: ReadonlyArray<{ name: string; shape: GeneratedCodecShape }> };

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function generatedCodecLiteralToPrimitiveShape(shape: Extract<GeneratedCodecShape, { kind: 'literal' }>): GeneratedCodecShape {
	if (typeof shape.value === 'string') return { kind: 'primitive', primitive: 'string' };
	if (typeof shape.value === 'number') {
		return {
			kind: 'primitive',
			primitive: 'number',
			numericKind: Number.isInteger(shape.value) ? 'u32' : 'f64',
		};
	}
	return { kind: 'primitive', primitive: 'boolean' };
}

function isGeneratedCodecTypedArrayInstance(value: unknown, arrayType: GeneratedCodecTypedArrayKind): value is TypedArrayTypes {
	switch (arrayType) {
		case 'Int8Array': return value instanceof Int8Array;
		case 'Uint8Array': return value instanceof Uint8Array;
		case 'Uint8ClampedArray': return value instanceof Uint8ClampedArray;
		case 'Int16Array': return value instanceof Int16Array;
		case 'Uint16Array': return value instanceof Uint16Array;
		case 'Int32Array': return value instanceof Int32Array;
		case 'Uint32Array': return value instanceof Uint32Array;
		case 'Float32Array': return value instanceof Float32Array;
		case 'Float64Array': return value instanceof Float64Array;
		case 'BigInt64Array': return value instanceof BigInt64Array;
		case 'BigUint64Array': return value instanceof BigUint64Array;
	}
}

function writeGeneratedCodecShape(writer: GeneratedCodecWriter, shape: GeneratedCodecShape, value: unknown): void {
	switch (shape.kind) {
		case 'primitive':
			if (shape.primitive === 'string') {
				writer.writeString(value as string);
				return;
			}
			if (shape.primitive === 'number') {
				if (shape.numericKind === 'u32') {
					writer.writeU32(value as number);
					return;
				}
				if (shape.numericKind === 'i32') {
					writer.writeI32(value as number);
					return;
				}
				writer.writeF64(value as number);
				return;
			}
			writer.writeBool(value as boolean);
			return;
		case 'undefined':
		case 'null':
			return;
		case 'bigint':
			writer.writeBigInt64(value as bigint);
			return;
		case 'unknown':
			writer.writeString(JSON.stringify(value ?? null));
			return;
		case 'literal':
			writeGeneratedCodecShape(writer, generatedCodecLiteralToPrimitiveShape(shape), value);
			return;
		case 'optional':
			writer.writeOptionalMarker(value !== undefined);
			if (value !== undefined) {
				writeGeneratedCodecShape(writer, shape.inner, value);
			}
			return;
		case 'date':
			if (shape.policy === 'epoch-ms') {
				writer.writeF64((value as Date).getTime());
				return;
			}
			writer.writeString((value as Date).toISOString());
			return;
		case 'map':
			if (shape.policy === 'entries') {
				const map = value as Map<unknown, unknown>;
				writer.writeU32(map.size);
				for (const [entryKey, entryValue] of map.entries()) {
					writeGeneratedCodecShape(writer, shape.key, entryKey);
					writeGeneratedCodecShape(writer, shape.value, entryValue);
				}
				return;
			}
			const map = value as Map<string, unknown>;
			writer.writeU32(map.size);
			for (const [entryKey, entryValue] of map.entries()) {
				writer.writeString(entryKey);
				writeGeneratedCodecShape(writer, shape.value, entryValue);
			}
			return;
		case 'record':
			const recordEntries = Object.entries((value ?? {}) as Record<string, unknown>);
			writer.writeU32(recordEntries.length);
			for (const [entryKey, entryValue] of recordEntries) {
				writer.writeString(entryKey);
				writeGeneratedCodecShape(writer, shape.value, entryValue);
			}
			return;
		case 'set':
			const set = value as Set<unknown>;
			writer.writeU32(set.size);
			for (const entry of set.values()) {
				writeGeneratedCodecShape(writer, shape.element, entry);
			}
			return;
		case 'union':
			for (let index = 0; index < shape.variants.length; index += 1) {
				const variant = shape.variants[index];
				if (!variant || !isGeneratedCodecShapeMatch(value, variant)) continue;
				writer.writeVariantIndex(index);
				if (variant.kind !== 'null') {
					writeGeneratedCodecShape(writer, variant, value);
				}
				return;
			}
			throw new Error('Union value did not match any generated codec variant.');
		case 'discriminated-union':
			for (let index = 0; index < shape.variants.length; index += 1) {
				const variant = shape.variants[index];
				if (!variant || (value as Record<string, unknown>)?.[shape.discriminator] !== variant.tagValue) continue;
				writer.writeVariantIndex(index);
				for (const property of variant.shape.properties) {
					if (property.name === shape.discriminator) continue;
					writeGeneratedCodecShape(writer, property.shape, (value as Record<string, unknown>)?.[property.name]);
				}
				return;
			}
			throw new Error('Discriminated union value did not match any generated codec variant.');
		case 'typed-array':
			writer.writeTypedArray(value as TypedArrayTypes);
			return;
		case 'array':
			if (shape.element.kind === 'primitive') {
				if (shape.element.primitive === 'string') {
					writer.writeStringArray(value as string[]);
					return;
				}
				if (shape.element.primitive === 'number') {
					if (shape.element.numericKind === 'u32') {
						writer.writeU32Array(value as number[]);
						return;
					}
					if (shape.element.numericKind === 'i32') {
						writer.writeI32Array(value as number[]);
						return;
					}
					writer.writeNumberArray(value as number[]);
					return;
				}
				writer.writeBooleanArray(value as boolean[]);
				return;
			}
			writer.writeU32((value as unknown[]).length);
			for (const entry of value as unknown[]) {
				writeGeneratedCodecShape(writer, shape.element, entry);
			}
			return;
		case 'tuple':
			for (let index = 0; index < shape.elements.length; index += 1) {
				writeGeneratedCodecShape(writer, shape.elements[index]!, (value as unknown[])[index]);
			}
			return;
		case 'object':
			for (const property of shape.properties) {
				writeGeneratedCodecShape(writer, property.shape, (value as Record<string, unknown>)?.[property.name]);
			}
			return;
	}
}

function readGeneratedCodecShape(reader: GeneratedCodecReader, shape: GeneratedCodecShape): unknown {
	switch (shape.kind) {
		case 'primitive':
			if (shape.primitive === 'string') return reader.readString();
			if (shape.primitive === 'number') {
				if (shape.numericKind === 'u32') return reader.readU32();
				if (shape.numericKind === 'i32') return reader.readI32();
				return reader.readF64();
			}
			return reader.readBool();
		case 'undefined':
			return undefined;
		case 'bigint':
			return reader.readBigInt64();
		case 'unknown':
			return JSON.parse(reader.readString());
		case 'null':
			return null;
		case 'literal':
			const literalValue = readGeneratedCodecShape(reader, generatedCodecLiteralToPrimitiveShape(shape));
			if (literalValue !== shape.value) throw new Error('Generated codec literal mismatch.');
			return literalValue;
		case 'optional':
			return reader.readOptionalMarker() ? readGeneratedCodecShape(reader, shape.inner) : undefined;
		case 'date':
			return shape.policy === 'epoch-ms' ? new Date(reader.readF64()) : new Date(reader.readString());
		case 'map':
			const mapCount = reader.readU32();
			const map = new Map();
			for (let index = 0; index < mapCount; index += 1) {
				const key = shape.policy === 'entries' ? readGeneratedCodecShape(reader, shape.key) : reader.readString();
				map.set(key, readGeneratedCodecShape(reader, shape.value));
			}
			return map;
		case 'record':
			const recordCount = reader.readU32();
			const record: Record<string, unknown> = {};
			for (let index = 0; index < recordCount; index += 1) {
				record[reader.readString()] = readGeneratedCodecShape(reader, shape.value);
			}
			return record;
		case 'set':
			const setCount = reader.readU32();
			const set = new Set();
			for (let index = 0; index < setCount; index += 1) {
				set.add(readGeneratedCodecShape(reader, shape.element));
			}
			return set;
		case 'union':
			const variantIndex = reader.readVariantIndex();
			const variant = shape.variants[variantIndex];
			if (!variant) throw new Error('Unknown generated union variant.');
			return readGeneratedCodecShape(reader, variant);
		case 'discriminated-union':
			const discriminatedIndex = reader.readVariantIndex();
			const discriminatedVariant = shape.variants[discriminatedIndex];
			if (!discriminatedVariant) throw new Error('Unknown generated union variant.');
			const value: Record<string, unknown> = { [shape.discriminator]: discriminatedVariant.tagValue };
			for (const property of discriminatedVariant.shape.properties) {
				if (property.name === shape.discriminator) continue;
				value[property.name] = readGeneratedCodecShape(reader, property.shape);
			}
			return value;
		case 'typed-array':
			return reader.readTypedArray();
		case 'array':
			if (shape.element.kind === 'primitive') {
				if (shape.element.primitive === 'string') return reader.readStringArray();
				if (shape.element.primitive === 'number') {
					if (shape.element.numericKind === 'u32') return reader.readU32Array();
					if (shape.element.numericKind === 'i32') return reader.readI32Array();
					return reader.readNumberArray();
				}
				return reader.readBooleanArray();
			}
			const itemCount = reader.readU32();
			const items = new Array(itemCount);
			for (let index = 0; index < itemCount; index += 1) {
				items[index] = readGeneratedCodecShape(reader, shape.element);
			}
			return items;
		case 'tuple':
			return shape.elements.map((element) => readGeneratedCodecShape(reader, element));
		case 'object':
			const objectValue: Record<string, unknown> = {};
			for (const property of shape.properties) {
				objectValue[property.name] = readGeneratedCodecShape(reader, property.shape);
			}
			return objectValue;
	}
}

function isGeneratedCodecShapeMatch(value: unknown, shape: GeneratedCodecShape): boolean {
	switch (shape.kind) {
		case 'primitive':
			if (shape.primitive === 'number') return typeof value === 'number';
			return typeof value === shape.primitive;
		case 'undefined':
			return value === undefined;
		case 'bigint':
			return typeof value === 'bigint';
		case 'unknown':
			return true;
		case 'null':
			return value === null;
		case 'literal':
			return value === shape.value;
		case 'optional':
			return value === undefined || isGeneratedCodecShapeMatch(value, shape.inner);
		case 'date':
			return value instanceof Date;
		case 'map':
			return value instanceof Map;
		case 'record':
			return value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Map) && !(value instanceof Set);
		case 'set':
			return value instanceof Set;
		case 'typed-array':
			return isGeneratedCodecTypedArrayInstance(value, shape.arrayType);
		case 'array':
			return Array.isArray(value);
		case 'tuple':
			return Array.isArray(value) && value.length === shape.elements.length;
		case 'object':
			return value !== null && typeof value === 'object';
		case 'union':
			return shape.variants.some((variant) => isGeneratedCodecShapeMatch(value, variant));
		case 'discriminated-union':
			return value !== null && typeof value === 'object' && shape.discriminator in (value as Record<string, unknown>);
	}
}

export function createGeneratedPayloadCodec<T>(shape: GeneratedCodecShape): RpcPayloadCodec<T> {
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

export function createGeneratedRpcMethodCodec<TArgs extends any[] = any[], TResult = any>(
	argsShape: GeneratedCodecShape,
	resultShape: GeneratedCodecShape,
): RpcMethodCodec<TArgs, TResult> {
	return {
		args: createGeneratedPayloadCodec<TArgs>(argsShape),
		result: createGeneratedPayloadCodec<Awaited<TResult>>(resultShape),
	};
}

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