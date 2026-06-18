# nodeServer

> **HTTP:** `POST /api/nodeServer` | **Type:** `async function nodeServer(): Promise<{ readonly createNodeHttpServer: (options: CreateNodeServerOptions) => Server<typeof IncomingMessage, typeof ServerResponse>; readonly createNodeRequestHandler: (handlers: NodeServerHandlers, options?: Pick<NodeServerOptions, "onUnhandledRoute" | "onRequestFinally" | "enableDocs" | "enableMcp" | "enableSyntheticRoutes" | "rpcPath">) => (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => Promise<void>; readonly createNodeServerHandlers: (options: CreateNodeServerOptions) => NodeServerHandlers; readonly withOpenTelemetryNodeServer: (options?: OpenTelemetryNodeServerOptions) => Promise<OpenTelemetryNodeServerRuntime>; }>` | **Location:** [`../../src/index.ts:197`](../../src/index.ts:197)

## Signature

```typescript
async function nodeServer(): Promise<{ readonly createNodeHttpServer: (options: CreateNodeServerOptions) => Server<typeof IncomingMessage, typeof ServerResponse>; readonly createNodeRequestHandler: (handlers: NodeServerHandlers, options?: Pick<NodeServerOptions, "onUnhandledRoute" | "onRequestFinally" | "enableDocs" | "enableMcp" | "enableSyntheticRoutes" | "rpcPath">) => (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => Promise<void>; readonly createNodeServerHandlers: (options: CreateNodeServerOptions) => NodeServerHandlers; readonly withOpenTelemetryNodeServer: (options?: OpenTelemetryNodeServerOptions) => Promise<OpenTelemetryNodeServerRuntime>; }>
```

## Returns

`{ readonly createNodeHttpServer: (options: CreateNodeServerOptions) => Server<typeof IncomingMessage, typeof ServerResponse>; readonly createNodeRequestHandler: (handlers: NodeServerHandlers, options?: Pick<NodeServerOptions, "onUnhandledRoute" | "onRequestFinally" | "enableDocs" | "enableMcp" | "enableSyntheticRoutes" | "rpcPath">) => (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => Promise<void>; readonly createNodeServerHandlers: (options: CreateNodeServerOptions) => NodeServerHandlers; readonly withOpenTelemetryNodeServer: (options?: OpenTelemetryNodeServerOptions) => Promise<OpenTelemetryNodeServerRuntime>; }`

Return value

## Implementation

```typescript
{
		createNodeHttpServer,
		createNodeRequestHandler,
		createNodeServerHandlers,
		withOpenTelemetryNodeServer,
	}
```

## Dependencies

### Internal

#### `{ readonly createNodeHttpServer: (options: CreateNodeServerOptions) => Server<typeof IncomingMessage, typeof ServerResponse>; readonly createNodeRequestHandler: (handlers: NodeServerHandlers, options?: Pick<NodeServerOptions, "onUnhandledRoute" | "onRequestFinally" | "enableDocs" | "enableMcp" | "enableSyntheticRoutes" | "rpcPath">) => (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => Promise<void>; readonly createNodeServerHandlers: (options: CreateNodeServerOptions) => NodeServerHandlers; readonly withOpenTelemetryNodeServer: (options?: OpenTelemetryNodeServerOptions) => Promise<OpenTelemetryNodeServerRuntime>; }` (type)

**Description:** Return type
