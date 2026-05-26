# nRPC Usage Guide

This guide is for using `@nogg-aholic/nrpc` at runtime.

Use this guide when you want to:

- run an nRPC server
- mount `/rpc`, synthetic `/api/...`, `/docs`, or `/mcp`
- consume generated contract artifacts at runtime
- call a service through typed nRPC clients
- mount an SDK-style plugin namespace into a larger host service

Do not use this guide for generation setup.
Generation belongs to `@nogg-aholic/nrpc-cli` and is documented in `nrpc-cli/BUILD_GUIDE.md` and `nrpc-cli/INSTRUCTION_MANUAL.md`.

## Runtime Ownership

`@nogg-aholic/nrpc` owns:

- binary RPC frame handling
- request dispatch against a service object
- synthetic route runtime handling
- typed runtime/client helpers
- runtime-side service composition helpers
- MCP HTTP handling

It does not own TypeScript reflection or code generation.

## Install

Runtime only:

```bash
npm install @nogg-aholic/nrpc
```

Or with Bun:

```bash
bun add @nogg-aholic/nrpc
```

If your app also generates artifacts, install `@nogg-aholic/nrpc-cli` separately as a dev dependency.

## Normal Runtime Flow

The standard runtime flow is:

1. define a service implementation
2. generate artifacts during development with `@nogg-aholic/nrpc-cli`
3. import the generated contract/docs/MCP artifacts into runtime code
4. mount the runtime endpoints you want to expose

Typical generated runtime artifacts are:

- `*.contract.ts`
- `*.surface.docs.ts`
- optionally `*.mcp-tools.ts`

## Service Shape

At runtime, nRPC dispatches against a plain nested object.

Example:

```ts
export function createChangeCaseService() {
  return {
    text: {
      formatName: async ({ value }: { value: string }) => ({
        camel: value,
      }),
    },
  };
}
```

The transport layer wraps this object. The service object itself is the important contract boundary.

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

This exposes synthetic JSON and `.nrpc` binary routes from the same runtime service.

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

Mount it before the synthetic route fallback.

## Typed Client Options

The runtime package also owns typed client helpers.

Typical client paths are:

- `/rpc` client with `createFetchRpcSurface`
- synthetic typed client with `createSyntheticRouteSurface`
- direct route caller with `createSyntheticRouteCaller`
- plain external clients using `fetch`

Use generated artifacts only where you want the typed/runtime-aware behavior.
Plain external clients do not need a manifest or runtime package dependency.

## SDK Plugin Composition

`@nogg-aholic/nrpc` can mount a separately generated SDK-style plugin namespace into a host service tree.

The runtime helper is:

- `mountRpcNamespace(...)`

The intended flow is:

1. generate the plugin package in SDK mode with `@nogg-aholic/nrpc-cli`
2. import the generated installer helper from the plugin contract
3. mount the plugin implementation into the host service object
4. generate the final host contract from the composed host root

Minimal host example:

```ts
import { installSdkPluginApiNamespace } from '../plugin/src/generated/sdk-plugin.contract.js';
import { createSdkPluginService } from '../plugin/src/service.js';
import { createChangeCaseService } from './service.js';

export function createHostService() {
	const hostService = createChangeCaseService();
	installSdkPluginApiNamespace(hostService, createSdkPluginService());
	return hostService;
}
```

If you need the lower-level helper directly:

```ts
import { mountRpcNamespace } from '@nogg-aholic/nrpc';
import { sdkPluginApiHttpRouteManifest } from '../plugin/src/generated/sdk-plugin.contract.js';

mountRpcNamespace(hostService, sdkPluginApiHttpRouteManifest, createSdkPluginService());
```

## Separation Rule

Keep this split strict:

- `src/` contains runtime code, service code, clients, and generated artifacts
- generation scripts belong outside runtime sources, usually under `scripts/`
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

For the sibling-package SDK plugin example:

```bash
cd ../nrpc-example-sdk-plugin
bun install
bun run generate

cd ../nrpc-example
bun install
bun run generate
bun run dev
bun run call:manifest
bun run call:no-manifest
```