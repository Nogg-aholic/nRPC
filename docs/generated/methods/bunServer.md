# bunServer

> **HTTP:** `POST /api/bunServer` | **Type:** `async function bunServer(): Promise<{ readonly createBunRequestHandler: (handlers: { rpcHandler: (request: Request) => Promise<Response>; syntheticRouteHandler: (request: Request) => Promise<Response | undefined>; mcpRouteHandler: (request: Request) => Promise<Response | undefined>; docsHandler: (request: Request) => { status: number; kind: "json" | "html"; body: unknown; } | null; }, options?: Pick<BunServerOptions, "enableDocs" | "enableMcp" | "enableSyntheticRoutes" | "rpcPath" | "mcpEndpoint">) => (request: Request) => Promise<Response>; readonly createBunServer: (options: CreateBunServerOptions) => Server<undefined>; readonly createBunServerHandlers: (options: CreateBunServerOptions) => { rpcHandler: (request: Request) => Promise<Response>; syntheticRouteHandler: (request: Request) => Promise<Response | undefined>; mcpRouteHandler: (request: Request) => Promise<Response | undefined>; docsHandler: (request: Request) => { status: number; kind: "json" | "html"; body: unknown; } | null; }; }>` | **Location:** [`../../src/index.ts:203`](../../src/index.ts:203)

## Signature

```typescript
async function bunServer(): Promise<{ readonly createBunRequestHandler: (handlers: { rpcHandler: (request: Request) => Promise<Response>; syntheticRouteHandler: (request: Request) => Promise<Response | undefined>; mcpRouteHandler: (request: Request) => Promise<Response | undefined>; docsHandler: (request: Request) => { status: number; kind: "json" | "html"; body: unknown; } | null; }, options?: Pick<BunServerOptions, "enableDocs" | "enableMcp" | "enableSyntheticRoutes" | "rpcPath" | "mcpEndpoint">) => (request: Request) => Promise<Response>; readonly createBunServer: (options: CreateBunServerOptions) => Server<undefined>; readonly createBunServerHandlers: (options: CreateBunServerOptions) => { rpcHandler: (request: Request) => Promise<Response>; syntheticRouteHandler: (request: Request) => Promise<Response | undefined>; mcpRouteHandler: (request: Request) => Promise<Response | undefined>; docsHandler: (request: Request) => { status: number; kind: "json" | "html"; body: unknown; } | null; }; }>
```

## Returns

`{ readonly createBunRequestHandler: (handlers: { rpcHandler: (request: Request) => Promise<Response>; syntheticRouteHandler: (request: Request) => Promise<Response | undefined>; mcpRouteHandler: (request: Request) => Promise<Response | undefined>; docsHandler: (request: Request) => { status: number; kind: "json" | "html"; body: unknown; } | null; }, options?: Pick<BunServerOptions, "enableDocs" | "enableMcp" | "enableSyntheticRoutes" | "rpcPath" | "mcpEndpoint">) => (request: Request) => Promise<Response>; readonly createBunServer: (options: CreateBunServerOptions) => Server<undefined>; readonly createBunServerHandlers: (options: CreateBunServerOptions) => { rpcHandler: (request: Request) => Promise<Response>; syntheticRouteHandler: (request: Request) => Promise<Response | undefined>; mcpRouteHandler: (request: Request) => Promise<Response | undefined>; docsHandler: (request: Request) => { status: number; kind: "json" | "html"; body: unknown; } | null; }; }`

Return value

## Implementation

```typescript
{
		createBunRequestHandler,
		createBunServer,
		createBunServerHandlers,
	}
```

## Dependencies

### Internal

#### `{ readonly createBunRequestHandler: (handlers: { rpcHandler: (request: Request) => Promise<Response>; syntheticRouteHandler: (request: Request) => Promise<Response | undefined>; mcpRouteHandler: (request: Request) => Promise<Response | undefined>; docsHandler: (request: Request) => { status: number; kind: "json" | "html"; body: unknown; } | null; }, options?: Pick<BunServerOptions, "enableDocs" | "enableMcp" | "enableSyntheticRoutes" | "rpcPath" | "mcpEndpoint">) => (request: Request) => Promise<Response>; readonly createBunServer: (options: CreateBunServerOptions) => Server<undefined>; readonly createBunServerHandlers: (options: CreateBunServerOptions) => { rpcHandler: (request: Request) => Promise<Response>; syntheticRouteHandler: (request: Request) => Promise<Response | undefined>; mcpRouteHandler: (request: Request) => Promise<Response | undefined>; docsHandler: (request: Request) => { status: number; kind: "json" | "html"; body: unknown; } | null; }; }` (type)

**Description:** Return type
