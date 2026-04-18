import { decodeRpcValue, encodeRpcValue } from './value-codec.js';
import type { RpcAwaitMessage, RpcCallMessage, RpcMethodCodec, RpcPayloadCodec, RpcReturnMessage } from './types.js';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function encodePayloadWithCodec<T>(value: T, codec?: RpcPayloadCodec<T>): Uint8Array {
  return codec ? codec.encode(value) : encodeRpcValue(value ?? null);
}

function decodePayloadWithCodec<T>(data: Uint8Array, offset: number, codec?: RpcPayloadCodec<T>): [T, number] {
  return codec ? codec.decode(data, offset) : decodeRpcValue(data, offset) as [T, number];
}

export function encodeRpcCallMessage(eventCode: number, methodName: string, args: unknown, componentId = ''): Uint8Array {
  const componentIdBytes = encoder.encode(componentId);
  const methodNameBytes = encoder.encode(methodName);
  const argsBytes = encodeRpcValue(args ?? null);
  const buf = new Uint8Array(1 + 1 + componentIdBytes.length + 1 + methodNameBytes.length + argsBytes.length);

  let offset = 0;
  buf[offset++] = eventCode & 0xff;
  buf[offset++] = componentIdBytes.length;
  buf.set(componentIdBytes, offset);
  offset += componentIdBytes.length;
  buf[offset++] = methodNameBytes.length;
  buf.set(methodNameBytes, offset);
  offset += methodNameBytes.length;
  buf.set(argsBytes, offset);
  return buf;
}

export function decodeRpcCallMessage(data: Uint8Array, expectedEventCode?: number): RpcCallMessage {
  if (expectedEventCode !== undefined && data[0] !== expectedEventCode) {
    throw new Error(`Unexpected RPC call event: ${data[0]}`);
  }

  let offset = 1;
  const componentIdLen = data[offset++];
  const componentId = decoder.decode(data.subarray(offset, offset + componentIdLen));
  offset += componentIdLen;

  const methodNameLen = data[offset++];
  const methodName = decoder.decode(data.subarray(offset, offset + methodNameLen));
  offset += methodNameLen;

  const [args] = decodeRpcValue(data, offset);
  return { eventCode: data[0] ?? 0, componentId, methodName, args };
}

export function encodeRpcCallMessageWithCodec(
  eventCode: number,
  methodName: string,
  args: unknown,
  codec?: RpcMethodCodec<any[], any>,
  componentId = '',
): Uint8Array {
  const componentIdBytes = encoder.encode(componentId);
  const methodNameBytes = encoder.encode(methodName);
  const argsBytes = encodePayloadWithCodec(args, codec?.args as RpcPayloadCodec<unknown> | undefined);
  const buf = new Uint8Array(1 + 1 + componentIdBytes.length + 1 + methodNameBytes.length + argsBytes.length);

  let offset = 0;
  buf[offset++] = eventCode & 0xff;
  buf[offset++] = componentIdBytes.length;
  buf.set(componentIdBytes, offset);
  offset += componentIdBytes.length;
  buf[offset++] = methodNameBytes.length;
  buf.set(methodNameBytes, offset);
  offset += methodNameBytes.length;
  buf.set(argsBytes, offset);
  return buf;
}

export function decodeRpcCallMessageWithCodec(data: Uint8Array, codec?: RpcMethodCodec<any[], any>, expectedEventCode?: number): RpcCallMessage {
  if (expectedEventCode !== undefined && data[0] !== expectedEventCode) {
    throw new Error(`Unexpected RPC call event: ${data[0]}`);
  }

  let offset = 1;
  const componentIdLen = data[offset++];
  const componentId = decoder.decode(data.subarray(offset, offset + componentIdLen));
  offset += componentIdLen;

  const methodNameLen = data[offset++];
  const methodName = decoder.decode(data.subarray(offset, offset + methodNameLen));
  offset += methodNameLen;

  const [args] = decodePayloadWithCodec(data, offset, codec?.args as RpcPayloadCodec<unknown> | undefined);
  return { eventCode: data[0] ?? 0, componentId, methodName, args };
}

export function encodeRpcAwaitMessage(eventCode: number, requestId: number, methodName: string, args: unknown, componentId = ''): Uint8Array {
  const componentIdBytes = encoder.encode(componentId);
  const methodNameBytes = encoder.encode(methodName);
  const argsBytes = encodeRpcValue(args ?? null);
  const buf = new Uint8Array(1 + 4 + 1 + componentIdBytes.length + 1 + methodNameBytes.length + argsBytes.length);
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  let offset = 0;
  buf[offset++] = eventCode & 0xff;
  view.setUint32(offset, requestId >>> 0, true);
  offset += 4;
  buf[offset++] = componentIdBytes.length;
  buf.set(componentIdBytes, offset);
  offset += componentIdBytes.length;
  buf[offset++] = methodNameBytes.length;
  buf.set(methodNameBytes, offset);
  offset += methodNameBytes.length;
  buf.set(argsBytes, offset);
  return buf;
}

export function decodeRpcAwaitMessage(data: Uint8Array, expectedEventCode?: number): RpcAwaitMessage {
  if (expectedEventCode !== undefined && data[0] !== expectedEventCode) {
    throw new Error(`Unexpected RPC await event: ${data[0]}`);
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let offset = 1;
  const requestId = view.getUint32(offset, true);
  offset += 4;

  const componentIdLen = data[offset++];
  const componentId = decoder.decode(data.subarray(offset, offset + componentIdLen));
  offset += componentIdLen;

  const methodNameLen = data[offset++];
  const methodName = decoder.decode(data.subarray(offset, offset + methodNameLen));
  offset += methodNameLen;

  const [args] = decodeRpcValue(data, offset);
  return { eventCode: data[0] ?? 0, requestId, componentId, methodName, args };
}

export function decodeRpcAwaitMethodName(data: Uint8Array, expectedEventCode?: number): string {
  if (expectedEventCode !== undefined && data[0] !== expectedEventCode) {
    throw new Error(`Unexpected RPC await event: ${data[0]}`);
  }

  let offset = 1 + 4;
  const componentIdLen = data[offset++] ?? 0;
  offset += componentIdLen;

  const methodNameLen = data[offset++] ?? 0;
  return decoder.decode(data.subarray(offset, offset + methodNameLen));
}

export function encodeRpcAwaitMessageWithCodec(
  eventCode: number,
  requestId: number,
  methodName: string,
  args: unknown,
  codec?: RpcMethodCodec<any[], any>,
  componentId = '',
): Uint8Array {
  const componentIdBytes = encoder.encode(componentId);
  const methodNameBytes = encoder.encode(methodName);
  const argsBytes = encodePayloadWithCodec(args, codec?.args as RpcPayloadCodec<unknown> | undefined);
  const buf = new Uint8Array(1 + 4 + 1 + componentIdBytes.length + 1 + methodNameBytes.length + argsBytes.length);
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  let offset = 0;
  buf[offset++] = eventCode & 0xff;
  view.setUint32(offset, requestId >>> 0, true);
  offset += 4;
  buf[offset++] = componentIdBytes.length;
  buf.set(componentIdBytes, offset);
  offset += componentIdBytes.length;
  buf[offset++] = methodNameBytes.length;
  buf.set(methodNameBytes, offset);
  offset += methodNameBytes.length;
  buf.set(argsBytes, offset);
  return buf;
}

export function decodeRpcAwaitMessageWithCodec(data: Uint8Array, codec?: RpcMethodCodec<any[], any>, expectedEventCode?: number): RpcAwaitMessage {
  if (expectedEventCode !== undefined && data[0] !== expectedEventCode) {
    throw new Error(`Unexpected RPC await event: ${data[0]}`);
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let offset = 1;
  const requestId = view.getUint32(offset, true);
  offset += 4;

  const componentIdLen = data[offset++];
  const componentId = decoder.decode(data.subarray(offset, offset + componentIdLen));
  offset += componentIdLen;

  const methodNameLen = data[offset++];
  const methodName = decoder.decode(data.subarray(offset, offset + methodNameLen));
  offset += methodNameLen;

  const [args] = decodePayloadWithCodec(data, offset, codec?.args as RpcPayloadCodec<unknown> | undefined);
  return { eventCode: data[0] ?? 0, requestId, componentId, methodName, args };
}

export function encodeRpcReturnMessage(eventCode: number, requestId: number, ok: boolean, payload: unknown): Uint8Array {
  const payloadBytes = encodeRpcValue(payload ?? null);
  const buf = new Uint8Array(1 + 4 + 1 + payloadBytes.length);
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  let offset = 0;
  buf[offset++] = eventCode & 0xff;
  view.setUint32(offset, requestId >>> 0, true);
  offset += 4;
  buf[offset++] = ok ? 1 : 0;
  buf.set(payloadBytes, offset);
  return buf;
}

export function decodeRpcReturnMessage(data: Uint8Array, expectedEventCode?: number): RpcReturnMessage {
  if (expectedEventCode !== undefined && data[0] !== expectedEventCode) {
    throw new Error(`Unexpected RPC return event: ${data[0]}`);
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const requestId = view.getUint32(1, true);
  const ok = data[5] === 1;
  const [payload] = decodeRpcValue(data, 6);
  return { eventCode: data[0] ?? 0, requestId, ok, payload };
}

export function encodeRpcReturnMessageWithCodec(
  eventCode: number,
  requestId: number,
  ok: boolean,
  payload: unknown,
  codec?: RpcMethodCodec<any[], any>,
): Uint8Array {
  const payloadBytes = encodePayloadWithCodec(payload, codec?.result as RpcPayloadCodec<unknown> | undefined);
  const buf = new Uint8Array(1 + 4 + 1 + payloadBytes.length);
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  let offset = 0;
  buf[offset++] = eventCode & 0xff;
  view.setUint32(offset, requestId >>> 0, true);
  offset += 4;
  buf[offset++] = ok ? 1 : 0;
  buf.set(payloadBytes, offset);
  return buf;
}

export function decodeRpcReturnMessageWithCodec(data: Uint8Array, codec?: RpcMethodCodec<any[], any>, expectedEventCode?: number): RpcReturnMessage {
  if (expectedEventCode !== undefined && data[0] !== expectedEventCode) {
    throw new Error(`Unexpected RPC return event: ${data[0]}`);
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const requestId = view.getUint32(1, true);
  const ok = data[5] === 1;
  const [payload] = ok
    ? decodePayloadWithCodec(data, 6, codec?.result as RpcPayloadCodec<unknown> | undefined)
    : decodeRpcValue(data, 6);
  return { eventCode: data[0] ?? 0, requestId, ok, payload };
}
