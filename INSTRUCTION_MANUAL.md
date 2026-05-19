## Purpose

This manual is for `@nogg-aholic/nrpc` runtime setup only.

Use this document when you want to:

- run an nRPC server
- expose `/rpc`, `/api`, `/docs`, or `/mcp`
- consume generated artifacts at runtime
- wire typed clients against the runtime package

Do not use this document for code generation setup.
Generation belongs to `@nogg-aholic/nrpc-cli` and is documented separately in `nrpc-cli/INSTRUCTION_MANUAL.md`.

## Runtime Responsibilities

`@nogg-aholic/nrpc` owns runtime behavior such as:

- RPC request handling
- synthetic HTTP route handling
- generated codec execution helpers
- typed client/runtime helpers
- MCP HTTP handler support

It does not own build-time reflection or artifact generation.

## Install

Runtime only:

```bash
npm install @nogg-aholic/nrpc
```

Or with Bun:

```bash
bun add @nogg-aholic/nrpc
```

If you also need code generation, install `@nogg-aholic/nrpc-cli` as a dev dependency separately.

## Runtime Setup Model

The normal runtime flow is:

1. define a service type and implementation
2. generate artifacts during development with `@nogg-aholic/nrpc-cli`
3. import generated artifacts into your runtime server
4. mount the endpoints you want to expose

Generated runtime artifacts typically include:

- `*.contract.ts`
- `*.surface.docs.ts`
- optionally `*.mcp-tools.ts`

## Minimal RPC Endpoint Setup

Use the generated codec registry and your service invoker with `createRpcFetchRequestHandler`.

```ts
import { createRpcFetchRequestHandler, createRpcMethodInvoker } from '@nogg-aholic/nrpc/web-runtime';
import { apiCodecRegistry } from './generated/change-case-api.contract.js';
import { createChangeCaseService } from './service.js';

const service = createChangeCaseService();
const invokeMethod = createRpcMethodInvoker(service);

const rpcHandler = createRpcFetchRequestHandler({
	codecResolver: apiCodecRegistry,
	invokeMethod,
	awaitEventCode: 0x11,
	returnEventCode: 0x12,
});
```

Mount it at `/rpc`:

```ts
if (request.method === 'POST' && url.pathname === '/rpc') {
	return rpcHandler(request);
}
```

## Minimal Synthetic Endpoint Setup

Use the generated HTTP route manifest and codec registry with `createSyntheticHttpRouteHandler`.

```ts
import { createSyntheticHttpRouteHandler } from '@nogg-aholic/nrpc/web-runtime';
import { apiCodecRegistry, apiHttpRouteManifest } from './generated/change-case-api.contract.js';

const syntheticRouteHandler = createSyntheticHttpRouteHandler({
	manifest: apiHttpRouteManifest,
	codecResolver: apiCodecRegistry,
	invokeMethod,
});
```

This gives you synthetic JSON and binary `.nrpc` routes from the same generated manifest.

## Docs Endpoint Setup

Use the generated self-contained docs runtime artifact.

```ts
import { generatedDocsRuntime } from './generated/change-case-api.surface.docs.js';

const docsResponse = generatedDocsRuntime.resolve(request);
if (docsResponse) {
	return docsResponse.kind === 'json'
		? Response.json(docsResponse.body, { status: docsResponse.status })
		: new Response(String(docsResponse.body), {
				status: docsResponse.status,
				headers: { 'content-type': 'text/html; charset=utf-8' },
			});
}
```

This supports:

- `/docs`
- `/docs/openapi.json`
- per-method `/_docs` routes

The generated docs artifact is intended to be self-contained and should not require `@nogg-aholic/nrpc-cli` at runtime.

## MCP Endpoint Setup

Use generated MCP tools with `createMcpHttpHandler`.

```ts
import { createMcpHttpHandler } from '@nogg-aholic/nrpc/mcp-http-handler';
import { createOpenApiMcpTools } from './generated/change-case-api.openapi-surface.mcp-tools.js';

const mcpHandler = createMcpHttpHandler({
	tools: createOpenApiMcpTools({
		baseUrl: 'http://127.0.0.1:4010',
	}),
	serverName: 'Change Case API',
	serverVersion: '0.1.0',
	endpointPath: '/mcp',
});
```

Mount it before the synthetic route fallback:

```ts
const mcpResponse = await mcpHandler(request);
if (mcpResponse) {
	return mcpResponse;
}
```

## Client Setup

The runtime package also owns typed client helpers.

Typical client options are:

- `/rpc` client with `createFetchRpcSurface`
- synthetic typed client with `createSyntheticRouteSurface`
- direct route caller with `createSyntheticRouteCaller`
- plain external clients using `fetch`

Use generated artifacts only where you actually want the typed/runtime-aware behavior.
Plain external clients do not need a manifest or runtime package dependency.

## Separation Rule

Keep this split strict:

- `src/` should contain runtime code, service code, clients, and generated artifacts
- generation scripts belong outside runtime sources, typically under `scripts/`
- `@nogg-aholic/nrpc-cli` is a dev dependency
- `@nogg-aholic/nrpc` is the runtime dependency

## Verification

Typical runtime verification flow:

1. run generation
2. start the server
3. verify `/rpc`
4. verify `/api/...`
5. verify `/docs`
6. verify `/mcp` if enabled

For the repository example:

```bash
bun run generate
bun run dev
bun run call:manifest
bun run call:no-manifest
```
