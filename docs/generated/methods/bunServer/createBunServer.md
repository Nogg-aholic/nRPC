# bunServer.createBunServer

> **HTTP:** `POST /api/bunServer/createBunServer` | **Type:** `async function bunServer.createBunServer(options: CreateBunServerOptions): Promise<Server<undefined>>` | **Location:** [`../../src/index.ts:205`](../../src/index.ts:205)

## Signature

```typescript
async function bunServer.createBunServer(options: CreateBunServerOptions): Promise<Server<undefined>>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `options` | `CreateBunServerOptions` | Yes | - |

## Returns

`Server<undefined>`

Return value

## Implementation

```typescript
(options: CreateBunServerOptions) => {
  const handlers = createBunServerHandlers(options);
  const fetchHandler = createBunRequestHandler(handlers, options);
  const port = options.port ?? 3000;

  const server = Bun.serve({
    port,
    fetch: fetchHandler,
  });

  console.log(`Server running at http://localhost:${port}`);
  console.log(`RPC endpoint: http://localhost:${port}${options.rpcPath ?? '/rpc'}`);
  if (options.enableSyntheticRoutes) {
    console.log(`Synthetic routes: http://localhost:${port}/api/...`);
  }
  if (options.enableMcp) {
    console.log(`MCP endpoint: http://localhost:${port}${options.mcpEndpoint ?? '/mcp'}`);
  }
  if (options.enableDocs) {
    console.log(`Docs: http://localhost:${port}/docs`);
  }

  return server;
}
```

## Dependencies

### Internal

#### `CreateBunServerOptions` (interface)
> **Location:** [`../../src/bun-server.ts:21`](../../src/bun-server.ts:21)

```typescript
export interface CreateBunServerOptions extends BunServerOptions {
  invokeMethod: RpcMethodInvoker;
  codecResolver: any;
  manifest?: HttpRouteManifest;
  mcpTools?: readonly McpToolLike[];
  docsRuntime?: {
    resolve: (request: Request) => { status: number; kind: 'json' | 'html'; body: unknown } | null;
  };
}
```

#### `createBunServerHandlers` (variable)
> **Location:** [`../../src/bun-server.ts:31`](../../src/bun-server.ts:31)

```typescript
createBunServerHandlers = (options: CreateBunServerOptions) => {
  const {
    invokeMethod,
    codecResolver,
    manifest,
    mcpTools,
    rpcPath = "/rpc",
    mcpEndpoint = "/mcp",
    defaultJsonEnvelope = false,
    enableDocs = true,
    enableMcp = true,
    enableSyntheticRoutes = true,
  } = options;

  const rpcHandler = createRpcFetchRequestHandler({
    codecResolver,
    invokeMethod,
    awaitEventCode: 0x11,
    returnEventCode: 0x12,
  });

  const syntheticRouteHandler = enableSyntheticRoutes && manifest
    ? createSyntheticHttpRouteHandler({
        manifest,
        codecResolver,
        invokeMethod,
        defaultJsonEnvelope,
      })
    : (_request: Request): Promise<Response | undefined> => Promise.resolve(undefined);

  const mcpRouteHandler = enableMcp && mcpTools
    ? createMcpHttpHandler({
        tools: mcpTools,
        serverName: options.serviceName ?? "nrpc server",
        serverVersion: options.serviceVersion ?? "0.1.0",
        endpointPath: mcpEndpoint,
      })
    : (_request: Request): Promise<Response | undefined> => Promise.resolve(undefined);

  const docsHandler = enableDocs && options.docsRuntime
    ? (request: Request): { status: number; kind: 'json' | 'html'; body: unknown } | null => {
        const result = options.docsRuntime!.resolve(request);
        return result ?? null;
      }
    : (_request: Request): { status: number; kind: 'json' | 'html'; body: unknown } | null => null;

  return {
    rpcHandler,
    syntheticRouteHandler,
    mcpRouteHandler,
    docsHandler,
  };
}
```

#### `createBunRequestHandler` (variable)
> **Location:** [`../../src/bun-server.ts:85`](../../src/bun-server.ts:85)

```typescript
createBunRequestHandler = (
  handlers: ReturnType<typeof createBunServerHandlers>,
  options: Pick<BunServerOptions, "enableDocs" | "enableMcp" | "enableSyntheticRoutes" | "rpcPath" | "mcpEndpoint"> = {},
) => {
  const { enableDocs = true, enableMcp = true, enableSyntheticRoutes = true, rpcPath = "/rpc", mcpEndpoint = "/mcp" } = options;

  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const path = url.pathname;

    // Docs endpoint
    if (enableDocs) {
      const docsResponse = handlers.docsHandler(request);
      if (docsResponse) {
        return docsResponse.kind === 'json'
          ? Response.json(docsResponse.body, { status: docsResponse.status })
          : new Response(String(docsResponse.body), {
              status: docsResponse.status,
              headers: {
                'content-type': 'text/html; charset=utf-8',
              },
            });
      }
    }

    // RPC endpoint
    if (path === rpcPath || path.startsWith(`${rpcPath}/`)) {
      return handlers.rpcHandler(request);
    }

    // MCP endpoint
    if (enableMcp && path === mcpEndpoint) {
      const mcpResponse = await handlers.mcpRouteHandler(request);
      if (mcpResponse) {
        return mcpResponse;
      }
    }

    // Synthetic route handler
    if (enableSyntheticRoutes) {
      const syntheticResponse = await handlers.syntheticRouteHandler(request);
      if (syntheticResponse) {
        return syntheticResponse;
      }
    }

    return Response.json({ error: { message: 'Route not found', type: 'not_found' } }, { status: 404 });
  };
}
```

#### `Server<undefined>` (type)

**Description:** Return type
