import { createServer, IncomingMessage, ServerResponse } from "node:http";
import type { RpcMethodInvoker } from "./web-runtime.js";
import type { HttpRouteManifest } from "./http-route-runtime.js";
import type { McpToolLike } from "./mcp-http-handler.js";
import { createRpcFetchRequestHandler, createSyntheticHttpRouteHandler, createRpcMethodInvoker } from "./web-runtime.js";
import { createMcpHttpHandler } from "./mcp-http-handler.js";

export interface NodeServerOptions {
  port?: number;
  serviceName?: string;
  serviceVersion?: string;
  mcpEndpoint?: string;
  rpcPath?: string;
  defaultJsonEnvelope?: boolean;
  enableDocs?: boolean;
  enableMcp?: boolean;
  enableSyntheticRoutes?: boolean;
  onUnhandledRoute?: (req: IncomingMessage, res: ServerResponse) => void;
}

export interface NodeServerHandlers {
  rpcHandler: (request: Request) => Promise<Response>;
  syntheticRouteHandler: (request: Request) => Promise<Response | undefined>;
  mcpRouteHandler: (request: Request) => Promise<Response | undefined>;
  docsHandler: (request: Request) => { status: number; kind: 'json' | 'html'; body: unknown } | null;
}

export interface CreateNodeServerOptions extends NodeServerOptions {
  invokeMethod: RpcMethodInvoker;
  codecResolver: any;
  manifest?: HttpRouteManifest;
  mcpTools?: readonly McpToolLike[];
  serverName?: string;
  serverVersion?: string;
  docsRuntime?: {
    resolve: (request: Request) => { status: number; kind: 'json' | 'html'; body: unknown } | null;
  };
}

export const createNodeServerHandlers = (options: CreateNodeServerOptions): NodeServerHandlers => {
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
        serverName: options.serverName ?? "nrpc server",
        serverVersion: options.serverVersion ?? "0.1.0",
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
};

export const createNodeRequestHandler = (
  handlers: NodeServerHandlers,
  options: Pick<NodeServerOptions, "onUnhandledRoute" | "enableDocs" | "enableMcp" | "enableSyntheticRoutes" | "rpcPath"> = {},
) => {
  const { onUnhandledRoute, enableDocs = true, enableMcp = true, enableSyntheticRoutes = true, rpcPath = "/rpc" } = options;

  return async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const path = url.pathname;

      // Convert Node.js IncomingMessage to Request
      const request = new Request(url, {
        method: req.method,
        headers: req.headers as HeadersInit,
      });

      // Docs endpoint
      if (enableDocs) {
        const docsResponse = handlers.docsHandler(request);
        if (docsResponse) {
          res.statusCode = docsResponse.status;
          res.setHeader("Content-Type", docsResponse.kind === "json" ? "application/json" : "text/html");
          res.end(docsResponse.kind === "json" ? JSON.stringify(docsResponse.body) : String(docsResponse.body));
          return;
        }
      }

      // RPC endpoint
      if (path === rpcPath || path.startsWith(`${rpcPath}/`)) {
        const response = await handlers.rpcHandler(request);
        res.statusCode = response.status;
        response.headers.forEach((value, key) => res.setHeader(key, value));
        res.end(await response.arrayBuffer());
        return;
      }

      // MCP endpoint
      if (enableMcp) {
        const mcpResponse = await handlers.mcpRouteHandler(request);
        if (mcpResponse) {
          res.statusCode = mcpResponse.status;
          mcpResponse.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(await mcpResponse.text());
          return;
        }
      }

      // Synthetic route handler
      if (enableSyntheticRoutes) {
        const syntheticResponse = await handlers.syntheticRouteHandler(request);
        if (syntheticResponse) {
          res.statusCode = syntheticResponse.status;
          syntheticResponse.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(await syntheticResponse.text());
          return;
        }
      }

      // Fallback
      if (onUnhandledRoute) {
        onUnhandledRoute(req, res);
        return;
      }

      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: { message: "Route not found", type: "not_found" } }));
    } catch (error) {
      console.error("Server error:", error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: { message: String(error) } }));
    }
  };
};

export const createNodeHttpServer = (options: CreateNodeServerOptions) => {
  const handlers = createNodeServerHandlers(options);
  const requestHandler = createNodeRequestHandler(handlers, options);
  const port = options.port ?? 3000;

  const server = createServer(requestHandler);
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`RPC endpoint: http://localhost:${port}/rpc`);
    if (options.enableSyntheticRoutes) {
      console.log(`Synthetic routes: http://localhost:${port}/api/...`);
    }
    if (options.enableMcp) {
      console.log(`MCP endpoint: http://localhost:${port}${options.mcpEndpoint ?? "/mcp"}`);
    }
    if (options.enableDocs) {
      console.log(`Docs: http://localhost:${port}/docs`);
    }
  });

  return server;
};

export const withOpenTelemetryNodeServer = (options: any = {}) => {
  // OTel setup is in node-server-otel.ts
  // This is a placeholder to re-export
  return {} as any;
};

export { createRpcMethodInvoker };
