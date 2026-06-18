# bunServer.createBunServerHandlers

> **HTTP:** `POST /api/bunServer/createBunServerHandlers` | **Type:** `async function bunServer.createBunServerHandlers(options: CreateBunServerOptions): Promise<{ rpcHandler: (request: Request) => Promise<Response>; syntheticRouteHandler: (request: Request) => Promise<Response | undefined>; mcpRouteHandler: (request: Request) => Promise<Response | undefined>; docsHandler: (request: Request) => { status: number; kind: "json" | "html"; body: unknown; } | null; }>` | **Location:** [`../../src/index.ts:206`](../../src/index.ts:206)

## Signature

```typescript
async function bunServer.createBunServerHandlers(options: CreateBunServerOptions): Promise<{ rpcHandler: (request: Request) => Promise<Response>; syntheticRouteHandler: (request: Request) => Promise<Response | undefined>; mcpRouteHandler: (request: Request) => Promise<Response | undefined>; docsHandler: (request: Request) => { status: number; kind: "json" | "html"; body: unknown; } | null; }>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `options` | `CreateBunServerOptions` | Yes | - |

## Returns

`{ rpcHandler: (request: Request) => Promise<Response>; syntheticRouteHandler: (request: Request) => Promise<Response | undefined>; mcpRouteHandler: (request: Request) => Promise<Response | undefined>; docsHandler: (request: Request) => { status: number; kind: "json" | "html"; body: unknown; } | null; }`

Return value

## Implementation

```typescript
(options: CreateBunServerOptions) => {
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

#### `createRpcFetchRequestHandler` (import)
> **Location:** [`../../src/bun-server.ts:4`](../../src/bun-server.ts:4)

```typescript
createRpcFetchRequestHandler
```

#### `createSyntheticHttpRouteHandler` (import)
> **Location:** [`../../src/bun-server.ts:4`](../../src/bun-server.ts:4)

```typescript
createSyntheticHttpRouteHandler
```

#### `createMcpHttpHandler` (import)
> **Location:** [`../../src/bun-server.ts:5`](../../src/bun-server.ts:5)

```typescript
createMcpHttpHandler
```

#### `{ rpcHandler: (request: Request) => Promise<Response>; syntheticRouteHandler: (request: Request) => Promise<Response | undefined>; mcpRouteHandler: (request: Request) => Promise<Response | undefined>; docsHandler: (request: Request) => { status: number; kind: "json" | "html"; body: unknown; } | null; }` (type)

**Description:** Return type
