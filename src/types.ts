export type TypedArrayTypes =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

export enum TypedArrayType {
  Int8 = 1,
  Uint8 = 2,
  Uint8Clamped = 3,
  Int16 = 4,
  Uint16 = 5,
  Int32 = 6,
  Uint32 = 7,
  Float32 = 8,
  Float64 = 9,
  BigInt64 = 10,
  BigUint64 = 11,
}

export enum RpcArgTag {
  Null = 0x00,
  Undefined = 0x09,
  False = 0x01,
  True = 0x02,
  Float64 = 0x03,
  String = 0x04,
  TypedArray = 0x05,
  Array = 0x06,
  Object = 0x07,
  BigInt64 = 0x08,
}

export type RpcCallMessage = {
  eventCode: number;
  componentId: string;
  methodName: string;
  args: unknown;
};

export type RpcAwaitMessage = RpcCallMessage & {
  requestId: number;
};

export type RpcReturnMessage = {
  eventCode: number;
  requestId: number;
  ok: boolean;
  payload: unknown;
};
