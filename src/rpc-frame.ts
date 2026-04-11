import { decodeRpcValue, encodeRpcValue } from './value-codec.js';
import type { RpcAwaitMessage, RpcCallMessage, RpcReturnMessage } from './types.js';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

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
