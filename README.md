# nRPC

`nRPC` is a small binary RPC codec package.

It extracts the reusable part of the transport layer: binary value encoding and compact RPC message framing. It does not know anything about component lookup, method dispatch, host APIs, websocket ownership, retries, or application semantics.

## Scope

`nRPC` is for the part you do not want to rewrite in every runtime:

- binary value encoding and decoding
- typed-array transport without JSON
- compact RPC frame encode and decode
- caller-controlled message event codes

`nRPC` is intentionally not responsible for:

- function resolution
- object graph lookup
- component registries
- transport I/O
- request lifecycle management
- auth, retries, reconnection, or multiplexing

## Features

- binary encoding for common JS values
- typed-array support, including bigint typed arrays
- generic call, await, and return frame helpers
- no framework assumptions
- ESM package with declaration output

## Supported Value Types

`encodeRpcValue` and `decodeRpcValue` support:

- `null`
- `undefined`
- `boolean`
- `number` as `Float64`
- `bigint` as signed `BigInt64`
- `string` as UTF-8
- arrays of supported values
- plain objects with string keys
- typed arrays:
	- `Int8Array`
	- `Uint8Array`
	- `Uint8ClampedArray`
	- `Int16Array`
	- `Uint16Array`
	- `Int32Array`
	- `Uint32Array`
	- `Float32Array`
	- `Float64Array`
	- `BigInt64Array`
	- `BigUint64Array`

Not supported:

- `Date`
- `Map`
- `Set`
- class instances with prototype semantics
- cyclic object graphs
- functions
- symbols

## Install

Install from npm:

```bash
npm install nrpc
```

Or with Bun:

```bash
bun add nrpc
```

For local package development:

```bash
bun run build
```

## Publish

Recommended flow:

1. Push the repository to GitHub.
2. Configure npm Trusted Publishing for the GitHub repository.
3. Push a version tag such as `v0.1.0`.
4. Let GitHub Actions publish the package.

The package includes a publish workflow at `.github/workflows/publish.yml`.

Trusted Publishing means you do not store or rotate an npm publish token in GitHub secrets. npm trusts the GitHub Actions identity for this repository instead.

At npm, add a trusted publisher for:

- owner: `Nogg-aholic`
- repository: `nRPC`
- workflow file: `.github/workflows/publish.yml`

Example:

```bash
git tag v0.1.0
git push origin v0.1.0
```

For a local packaging check before tagging:

```bash
npm pack --dry-run
```

## API

### Value Codec

- `encodeRpcValue(value: unknown): Uint8Array`
- `decodeRpcValue(data: Uint8Array, offset?: number): [unknown, number]`

These functions only encode a value payload. They do not add any RPC request metadata.

### Frame Codec

- `encodeRpcCallMessage(eventCode, methodName, args, componentId?)`
- `decodeRpcCallMessage(data, expectedEventCode?)`
- `encodeRpcAwaitMessage(eventCode, requestId, methodName, args, componentId?)`
- `decodeRpcAwaitMessage(data, expectedEventCode?)`
- `encodeRpcReturnMessage(eventCode, requestId, ok, payload)`
- `decodeRpcReturnMessage(data, expectedEventCode?)`

The frame helpers are generic. You provide the event byte so the package can be reused across different protocols and directions.

### Types And Enums

- `RpcArgTag`
- `TypedArrayType`
- `TypedArrayTypes`
- `RpcCallMessage`
- `RpcAwaitMessage`
- `RpcReturnMessage`

### Utility Exports

- `isTypedArray`
- `isPlainObject`
- `align8`
- `getTypedArrayType`
- `toUint8Array`
- `createTypedArray`

## Examples

### Encode And Decode A Value

```ts
import { decodeRpcValue, encodeRpcValue } from 'nrpc';

const encoded = encodeRpcValue({
	ok: true,
	count: 3,
	bytes: new Uint8Array([1, 2, 3]),
});

const [decoded] = decodeRpcValue(encoded);
```

### Encode An Awaiting RPC Call

```ts
import { encodeRpcAwaitMessage } from 'nrpc';

const RPC_CALL_AWAIT = 0x0b;

const message = encodeRpcAwaitMessage(
	RPC_CALL_AWAIT,
	42,
	'workspace.openTextDocument',
	['README.md'],
	'',
);
```

### Decode An Awaiting RPC Call

```ts
import { decodeRpcAwaitMessage } from 'nrpc';

const RPC_CALL_AWAIT = 0x0b;

const decoded = decodeRpcAwaitMessage(message, RPC_CALL_AWAIT);

// decoded.requestId
// decoded.methodName
// decoded.componentId
// decoded.args
```

### Encode A Return Frame

```ts
import { encodeRpcReturnMessage } from 'nrpc';

const RPC_RETURN = 0x2a;

const reply = encodeRpcReturnMessage(
	RPC_RETURN,
	42,
	true,
	{ success: true },
);
```

### Decode A Return Frame

```ts
import { decodeRpcReturnMessage } from 'nrpc';

const RPC_RETURN = 0x2a;

const result = decodeRpcReturnMessage(reply, RPC_RETURN);

if (!result.ok) {
	throw new Error(String(result.payload));
}
```

### One Protocol, Different Directions

```ts
import {
	decodeRpcReturnMessage,
	encodeRpcAwaitMessage,
	encodeRpcReturnMessage,
} from 'nrpc';

const clientToServer = {
	callAwait: 0x0b,
	return: 0x0c,
};

const serverToClient = {
	callAwait: 0x2b,
	return: 0x2a,
};

const outbound = encodeRpcAwaitMessage(clientToServer.callAwait, 7, 'foo.bar', [1, 2, 3]);
const reply = encodeRpcReturnMessage(serverToClient.return, 7, true, { ok: true });
const inbound = decodeRpcReturnMessage(reply, serverToClient.return);
```

The important part is that `nRPC` does not assume the protocol direction. The caller owns the event-byte map.

## Wire Format

At a high level, values use a tagged binary format:

- 1 byte tag
- optional fixed-width scalar payload
- or length-prefixed variable payload
- typed-array payloads are aligned to 8 bytes relative to the start of the encoded value

RPC frames then prepend protocol metadata around the encoded value payload.

### Call Frame

```text
[event: u8]
[componentIdLen: u8]
[componentId: bytes]
[methodNameLen: u8]
[methodName: bytes]
[args: rpc-value]
```

### Await Frame

```text
[event: u8]
[requestId: u32-le]
[componentIdLen: u8]
[componentId: bytes]
[methodNameLen: u8]
[methodName: bytes]
[args: rpc-value]
```

### Return Frame

```text
[event: u8]
[requestId: u32-le]
[ok: u8]
[payload: rpc-value]
```

## Design Notes

- Numbers are always encoded as `Float64`.
- `bigint` is encoded as signed 64-bit, so values must fit `BigInt64` range.
- Plain objects mean object literals with string keys and serializable values.
- Typed arrays preserve raw bytes instead of going through JSON.
- Alignment is relative to the start of the RPC value section, not the outer transport frame.

## When To Use This

Use `nRPC` when you need:

- a compact binary transport between runtimes
- typed arrays without base64 or JSON overhead
- a reusable RPC framing layer across multiple packages

Do not use `nRPC` as your full RPC runtime. Pair it with your own resolver, dispatcher, and transport lifecycle.

