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

### Generated Codecs

For object-heavy payloads, generic value encoding is often not the best path. `nRPC` includes build-time codec generation, but the intended default is namespace-wide generation from a single reflected contract root.

Use generated codecs when:

- the method shape is stable
- you want smaller payloads than generic object encoding
- you want direct typed-array handling without JSON expansion
- you want codec metadata attached to the same endpoint refs the client already uses

The generator currently supports:

- `string`, `number`, `boolean`
- integer-width specialization for integer-like fields such as `count`, `index`, `length`, `size`, `id`
- `bigint`
- optional via `undefined`
- literal unions
- discriminated unions
- arrays and tuples
- typed arrays such as `Uint8Array` and `Float32Array`
- plain objects
- policy-controlled `Date`, `Map`, and `Set`

Important distinction:

- `number[]` stays a logical array and is encoded as an array
- `Uint8Array` or `Float32Array` is treated as a typed-array payload and encoded as raw bytes with typed-array metadata

So if you want buffer-like transport in generated schemas, declare the field as a typed array type rather than a plain JS array type.

The preferred flow is:

1. define one exported contract root
2. generate one endpoint surface from that root
3. let `nRPC` emit all method codecs and a registry automatically

Per-method generation still exists as a low-level tool, but it is not the recommended starting point for app or framework surfaces.

#### Low-Level: Per-Method Codec Generation

The method-level CLI still works from exported type aliases or interfaces in a source module.

```ts
export type GetChartArgs = [{ sampleCount: number }];

export type GetChartResult = {
	label: string;
	samples: Float32Array;
	markers: number[];
};
```

#### 2. Generate A Codec Module

With the package CLI:

```bash
nrpc-generate-codec \
	--in ./src/chart-contract.ts \
	--out ./src/generated/get-chart.codec.ts \
	--method chart.get \
	--args GetChartArgs \
	--result GetChartResult
```

Or with Bun during local development:

```bash
bun run ./src/generate-codec-cli.ts \
	--in ./src/chart-contract.ts \
	--out ./src/generated/get-chart.codec.ts \
	--method chart.get \
	--args GetChartArgs \
	--result GetChartResult
```

Optional policy flags:

- `--date-policy iso-string|epoch-ms|reject`
- `--map-policy entries|object|reject`
- `--set-policy array|reject`

Defaults are `reject` for all three, so those types must be opted into explicitly.

#### 3. Import The Generated Method Ref

The generated module exports both a codec object and a method ref with codec metadata attached.

```ts
import { benchmarkObjectHeavyMethodRef } from './generated/object-heavy.codec.js';
```

The generated method ref is already wrapped with `withRpcMethodCodec(...)`, so `getRpcMethodCodec(...)` can retrieve the method codec later.

#### 4. Use Codec-Aware Frame Helpers

On the caller side:

```ts
import {
	encodeRpcAwaitMessageWithCodec,
	getRpcMethodCodec,
	getRpcMethodName,
} from '@nogg-aholic/nrpc';
import { getChartMethodRef } from './generated/get-chart.codec.js';

const methodName = getRpcMethodName(getChartMethodRef)!;
const codec = getRpcMethodCodec(getChartMethodRef)!;

const request = encodeRpcAwaitMessageWithCodec(
	0x11,
	1,
	methodName,
	[{ sampleCount: 4096 }],
	codec,
);
```

On the receiver side:

```ts
import {
	decodeRpcAwaitMessageWithCodec,
	encodeRpcReturnMessageWithCodec,
	getRpcMethodCodec,
} from '@nogg-aholic/nrpc';
import { getChartMethodRef } from './generated/get-chart.codec.js';

const codec = getRpcMethodCodec(getChartMethodRef)!;
const decoded = decodeRpcAwaitMessageWithCodec(requestBytes, codec, 0x11);

const response = encodeRpcReturnMessageWithCodec(
	0x12,
	decoded.requestId,
	true,
	{
		label: 'demo',
		samples: new Float32Array(4096),
		markers: [1, 4, 9],
	},
	codec,
);
```

And on the client when decoding the return frame:

```ts
import {
	decodeRpcReturnMessageWithCodec,
	getRpcMethodCodec,
} from '@nogg-aholic/nrpc';
import { getChartMethodRef } from './generated/get-chart.codec.js';

const codec = getRpcMethodCodec(getChartMethodRef)!;
const result = decodeRpcReturnMessageWithCodec(responseBytes, codec, 0x12);
```

#### 5. Add It To Your Build

Typical package script:

```json
{
	"scripts": {
		"generate:chart-codec": "nrpc-generate-codec --in ./src/chart-contract.ts --out ./src/generated/get-chart.codec.ts --method chart.get --args GetChartArgs --result GetChartResult"
	}
}
```

Run that before the app build if the source contract changed.

### Generated Endpoint Surfaces

If you already have a namespace-style contract type and want one build step that emits:

- a typed client surface
- generated method codecs for every endpoint
- a generated codec registry for server-side lookup
- optional global declaration text
- optional runtime install text

use the endpoint-surface generator.

Example source contract:

```ts
export type ServerApi = {
	users: {
		byId: (id: string) => Promise<User>;
		search: (query: SearchQuery) => Promise<SearchResult>;
	};
	docs: {
		get: (symbol: RpcSymbolRef) => Promise<OpenApiDocument>;
	};
};
```

Generate the exportable artifacts:

```bash
nrpc-generate-endpoint-surface \
	--in ./src/server-contract.ts \
	--root ServerApi \
	--out ./src/generated/server-api.surface.ts \
	--root-path api \
	--global api
```

That emits:

- `server-api.contract.ts`
- `server-api.surface.docs.ts`

The contract file contains the typed RPC definition, shape-based codec registry, and HTTP route manifest.

This is the right path when your server already exposes a namespace of methods and you want one generated contract artifact plus one docs artifact from that single source of truth.

### Bun Server Example

There is a runnable example in [examples/nrpc-bun-server](../examples/nrpc-bun-server).

It shows this flow end to end:

- define a namespace-style contract type
- generate one typed contract and one docs artifact
- serve a Bun HTTP endpoint that dispatches by generated method name
- call the generated contract over binary `nRPC` frames

Contract:

```ts
export type DemoApi = {
	math: {
		add: (left: number, right: number) => Promise<number>;
		summarize: (values: number[]) => Promise<{ total: number; terms: number[] }>;
	};
	greetings: {
		hello: (name: string, excited?: boolean) => Promise<{ message: string; createdAtIso: string }>;
	};
};
```

Generate the surface:

```bash
cd examples/nrpc-bun-server
bun run generate
```

That emits:

- `src/generated/demo-api.contract.ts`
- `src/generated/demo-api.surface.docs.ts`

Start the server:

```bash
bun run dev
```

In another terminal, run the client demo:

```bash
bun run client
```

The example server accepts binary `POST /rpc` requests, decodes the incoming await frame, looks up the generated codec by method name through the generated registry, dispatches into the local namespace implementation, and replies with a binary return frame.

On the client side, the generated `apiRpcSurface` already has the correct reflected type shape and codec-aware method refs, so the caller only needs `getRpcMethodName(...)`, `getRpcMethodCodec(...)`, and the `encode/decode ... WithCodec(...)` helpers.

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
- `createEndpointSurface<T>`
- `createRpcProxy<T>`
- `createRpcCodecRegistry`
- `getRpcMethodName`
- `getRpcMethodCodec`
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

const api = createEndpointSurface<Api>(['api']);

const userList = await callOnServerAsync(api.users.list);
// inferred as UserList
```

The important point is that `nRPC` does not need generated return types here. The callable type already exists, so wrappers can use `Parameters<T>` and `ReturnType<T>` directly.

If you also have generated codecs for that same contract root, `createEndpointSurface<T>(...)` is the right abstraction because it preserves the reflected shape and can resolve codec metadata for the same refs.

For editor structure and syntax highlighting, the important piece is the typed proxy shape implied by `Rpcify<Api>`. Conceptually, `createEndpointSurface<Api>(['api'])` gives TypeScript the same callable surface shape as `createRpcProxy<Api>(['api'])`, but leaves room for codec resolution.

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

If the client can see a typed callable shape, prefer one reflected contract root and build everything from that.

```ts
import { createEndpointSurface } from '@nogg-aholic/nrpc';

type Api = {
	users: {
		list: (includeInactive?: boolean) => Promise<UserList>;
		byId: (id: string) => Promise<User>;
	};
};

const api = createEndpointSurface<Api>(['api']);

const listUsers = api.users.list;

const users = await callOnServerAsync(api.users.list, true);
const user = await callOnServerAsync(api.users.byId, '42');
```

This works because `Rpcify<T>` preserves the source function shape:

- argument list from `Parameters<T>`
- result type from `ReturnType<T>`

So `api.users.list` is not an untyped string path or `any`. It is a callable RPC reference whose type is derived from the original `Api['users']['list']` signature through `Rpcify<T>`.

When you also generate codecs from that same root contract, do not create a second parallel API description and do not manually register every method. Generate once from the root and use the emitted surface plus codec registry.

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
			runtimeExpression: "createEndpointSurface(['vscode'])",
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

