# nRPC

`nRPC` is a small binary RPC codec package with typed callable references.

It extracts the reusable part of the transport layer: binary value encoding, compact RPC message framing, and typed callable references that can be resolved by a higher-level runtime. It does not know anything about component lookup, method dispatch, websocket ownership, retries, or application semantics.

## Scope

`nRPC` is for the part you do not want to rewrite in every runtime:

- binary value encoding and decoding
- typed-array transport without JSON
- compact RPC frame encode and decode
- caller-controlled message event codes
- typed callable references for ergonomic callsites

`nRPC` is intentionally not responsible for:

- function resolution policy
- object graph lookup
- component registries
- transport I/O
- request lifecycle management
- auth, retries, reconnection, or multiplexing

## Features

- binary encoding for common JS values
- typed-array support, including bigint typed arrays
- generic call, await, and return frame helpers
- typed callable references for ergonomic RPC callsites
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
npm install @nogg-aholic/nrpc
```

Or with Bun:

```bash
bun add @nogg-aholic/nrpc
```

For local package development:

```bash
bun run build
```

## Releases

Releases are published from the GitHub repository and distributed on npm as `@nogg-aholic/nrpc`.

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
- `Rpcify<T>`
- `RpcMethodRef<Args, Result>`
- `RpcSymbolRef`
- `SyntheticRpcBinding`
- `SyntheticRpcSurfaceDefinition`
- `HostRpcBinding`
- `HostRpcSurfaceDefinition`

### Utility Exports

- `isTypedArray`
- `isPlainObject`
- `align8`
- `getTypedArrayType`
- `toUint8Array`
- `createTypedArray`
- `createNamedRpcMethodRef`
- `createRpcProxy<T>`
- `getRpcMethodName`
- `isRpcMethodRef`
- `serializeRpcMethodRefs`
- `defineSyntheticRpcBinding`
- `defineSyntheticRpcSurface`
- `defineHostRpcSurface`
- `buildSyntheticRpcDeclaration`
- `buildSyntheticRpcRuntime`
- `asUpstreamProxyInjectionDefinition`

## Callable Models

`nRPC` supports two practical ways to get a typed callable into an RPC callsite.

### 1. Reflected Callables

Use this when the callable already exists as a real typed function value in the consumer's TypeScript world.

Examples:

- a shared service contract
- a typed API surface such as `api.users.list`
- a framework-owned callable that is mapped at runtime

This is the ideal path because TypeScript can infer parameters and return values directly from the original function signature.

```ts
type Api = {
	users: {
		list: () => Promise<UserList>;
	};
};

const api = createRpcProxy<Api>(['api']);

const userList = await callOnServerAsync(api.users.list);
// inferred as UserList
```

The important point is that `nRPC` does not need generated return types here. The callable type already exists, so wrappers can use `Parameters<T>` and `ReturnType<T>` directly.

For editor structure and syntax highlighting, the important piece is the typed proxy shape implied by `Rpcify<Api>`. Conceptually, `createRpcProxy<Api>(['api'])` gives TypeScript something like this:

```ts

```

That is why `api.users.list` becomes a known callable property instead of an untyped path. The proxy does not need to execute for this typing to exist, but the typed proxy expression or an equivalent generated declaration does need to exist in code.

### 2. Synthetic Callables

Use this when no real function value exists locally, but you still want a typed callable reference.

Examples:

- host APIs exposed from another runtime
- globals such as `vscode`
- named helper refs such as `getDocs`
- any external surface that must be installed into runtime and ambient type space

In this model, you define a synthetic RPC surface and then generate:

- declaration content for type availability
- runtime installation code for callable refs

The synthetic callable still behaves like a typed function reference at the callsite, but it is backed by metadata rather than a local implementation.

## Designing A Reflected Surface

If the client can see a typed callable shape, prefer reflection over generation.

```ts
import { createRpcProxy } from '@nogg-aholic/nrpc';

type Api = {
	users: {
		list: (includeInactive?: boolean) => Promise<UserList>;
		byId: (id: string) => Promise<User>;
	};
};

const api = createRpcProxy<Api>(['api']);

const listUsers = api.users.list;

const users = await callOnServerAsync(api.users.list, true);
const user = await callOnServerAsync(api.users.byId, '42');
```

This works because `Rpcify<T>` preserves the source function shape:

- argument list from `Parameters<T>`
- result type from `ReturnType<T>`

So `api.users.list` is not an untyped string path or `any`. It is a callable RPC reference whose type is derived from the original `Api['users']['list']` signature through `Rpcify<T>`.

If you want that structure to exist without a direct `createRpcProxy<Api>(...)` expression in user code, you must generate and expose an equivalent typed declaration for the proxy surface.

That means the important guarantee is at the callsite:

```ts
const users = await callOnServerAsync(api.users.list, true);
// users: UserList
```

not that the editor will necessarily display `api.users.list` itself as the raw original function type text.

That is the main ergonomic path for frameworks like Elysia when the app can share or import the original contract type.

## Designing A Synthetic Surface

When reflection is not possible, define a synthetic surface.

```ts
import { defineHostRpcSurface } from '@nogg-aholic/nrpc';

export const vscodeHostSurface = defineHostRpcSurface({
	id: 'vscode',
	rootPath: ['vscode'],
	declarationTypes: [
		"type VscodeApi = Rpcify<typeof import('vscode-api-contract')>;",
	],
	bindings: [
		{
			name: 'vscode',
			declarationLines: ["  var vscode: VscodeApi;"],
			runtimeExpression: "createRpcProxy(['vscode'])",
		},
		{
			name: 'getDocs',
			declarationLines: [
				"  var getDocs:",
				"    ((symbolOrReference: RpcSymbolRef) => Promise<string>) & { __nrpcMethodName?: string };",
			],
			runtimeExpression: "createNamedRpcMethodRef('getDocs')",
		},
	],
});
```

Then generate declaration content:

```ts
const declarationText = buildSyntheticRpcDeclaration(vscodeHostSurface);
```

And generate runtime installation content:

```ts
const runtimeText = buildSyntheticRpcRuntime(vscodeHostSurface);
```

`nRPC` does not decide where these generated strings are written. That belongs to the integration runtime or build tooling.

## Surface Helpers

### `defineSyntheticRpcBinding(...)`

Identity helper for a single synthetic binding.

### `defineSyntheticRpcSurface(...)`

Identity helper for a generic synthetic RPC surface.

### `defineHostRpcSurface(...)`

Alias of `defineSyntheticRpcSurface(...)` for the common "host/global surface" use case.

### `buildSyntheticRpcDeclaration(...)`

Builds ambient declaration text for a synthetic surface.

This is useful when you need globals or externally installed callable refs to exist in TypeScript without importing an implementation.

### `buildSyntheticRpcRuntime(...)`

Builds runtime installation lines for a synthetic surface.

By default it emits assignments to `globalThis`, but callers can customize expression rewriting and assignment targets.

### `asUpstreamProxyInjectionDefinition(...)`

Compatibility helper that converts the new synthetic surface shape into the legacy `UpstreamProxyInjectionDefinition` shape.

Use this only when integrating with older tooling that still expects `globals` instead of `bindings`.

## Examples

### Encode And Decode A Value

```ts
import { decodeRpcValue, encodeRpcValue } from '@nogg-aholic/nrpc';

const encoded = encodeRpcValue({
	ok: true,
	count: 3,
	bytes: new Uint8Array([1, 2, 3]),
});

const [decoded] = decodeRpcValue(encoded);
```

### Encode An Awaiting RPC Call

```ts
import { encodeRpcAwaitMessage } from '@nogg-aholic/nrpc';

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
import { decodeRpcAwaitMessage } from '@nogg-aholic/nrpc';

const RPC_CALL_AWAIT = 0x0b;

const decoded = decodeRpcAwaitMessage(message, RPC_CALL_AWAIT);

// decoded.requestId
// decoded.methodName
// decoded.componentId
// decoded.args
```

### Encode A Return Frame

```ts
import { encodeRpcReturnMessage } from '@nogg-aholic/nrpc';

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
import { decodeRpcReturnMessage } from '@nogg-aholic/nrpc';

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
} from '@nogg-aholic/nrpc';

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

## Integration Guidance

If you are designing a higher-level RPC runtime on top of `nRPC`, use this rule:

- prefer reflected callables whenever the original callable type already exists
- use synthetic surfaces only when the callable does not exist locally and must be installed or generated

That distinction matters because synthetic declarations are not the source of the typing magic. They are only a fallback used to manufacture typed callable references when reflection is impossible.

In other words:

- reflection gives you direct type inference from the original function type
- synthesis gives you a typed stand-in when no local function value exists

Both paths are valid. Reflection should be the default.

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

Do not use `nRPC` as your full RPC runtime. Pair it with your own resolver, dispatcher, surface installation, and transport lifecycle.

