import { createServer, IncomingMessage, ServerResponse } from "node:http";
import type { RpcMethodInvoker } from "./web-runtime.js";
import type { HttpRouteManifest } from "./http-route-runtime.js";
import type { McpToolLike } from "./mcp-http-handler.js";
import { createRpcFetchRequestHandler, createSyntheticHttpRouteHandler, createRpcMethodInvoker } from "./web-runtime.js";
import { createMcpHttpHandler } from "./mcp-http-handler.js";

const createRequestBodyStream = (req: IncomingMessage): ReadableStream<Uint8Array> => {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      req.on("data", (chunk: Buffer | string) => {
        controller.enqueue(typeof chunk === "string" ? new TextEncoder().encode(chunk) : new Uint8Array(chunk));
      });
      req.on("end", () => controller.close());
      req.on("error", (error: Error) => controller.error(error));
    },
    cancel() {
      req.destroy();
    },
  });
};

const createRequestHeaders = (req: IncomingMessage): Headers => {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      headers.set(key, value.join(", "));
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }
  return headers;
};

const toRequest = (req: IncomingMessage, url: URL): Request => {
  const method = req.method ?? "GET";
  const body = method === "GET" || method === "HEAD" ? undefined : createRequestBodyStream(req);
  const init: RequestInit & { duplex?: "half" } = {
    method,
    headers: createRequestHeaders(req),
    body,
    duplex: body ? "half" : undefined,
  };
  return new Request(url.toString(), init);
};

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
  onRequestFinally?: () => void | Promise<void>;
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
  options: Pick<NodeServerOptions, "onUnhandledRoute" | "onRequestFinally" | "enableDocs" | "enableMcp" | "enableSyntheticRoutes" | "rpcPath"> = {},
) => {
  const { onUnhandledRoute, onRequestFinally, enableDocs = true, enableMcp = true, enableSyntheticRoutes = true, rpcPath = "/rpc" } = options;

  return async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const path = url.pathname;

      const request = toRequest(req, url);

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
    } finally {
      await onRequestFinally?.();
    }
  };
};

export const createNodeHttpServer = (options: CreateNodeServerOptions) => {
  const handlers = createNodeServerHandlers(options);
  const requestHandler = createNodeRequestHandler(handlers, options);
  const port = options.port ?? 3000;
  const rpcPath = options.rpcPath ?? "/rpc";

  const server = createServer(requestHandler);
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`RPC endpoint: http://localhost:${port}${rpcPath}`);
    if (options.enableSyntheticRoutes !== false) {
      console.log(`Synthetic routes: http://localhost:${port}/api/...`);
    }
    if (options.enableMcp !== false) {
      console.log(`MCP endpoint: http://localhost:${port}${options.mcpEndpoint ?? "/mcp"}`);
    }
    if (options.enableDocs !== false) {
      console.log(`Docs: http://localhost:${port}/docs`);
    }
  });

  return server;
};

type ConsoleMethod = (...args: unknown[]) => void;

type OpenTelemetrySeverityNumber = {
  INFO: number;
  WARN: number;
  ERROR: number;
};

type OpenTelemetryLogger = {
  emit(record: { severityNumber: number; severityText: string; body: string }): void;
};

type OpenTelemetryLoggerProvider = {
  getLogger(name: string): OpenTelemetryLogger;
  forceFlush(): Promise<void>;
  shutdown(): Promise<void>;
};

type OpenTelemetrySdk = {
  start(): void;
  shutdown(): Promise<void>;
};

type OpenTelemetryModuleSet = {
  NodeSDK: new (options: Record<string, unknown>) => OpenTelemetrySdk;
  OTLPTraceExporter: new (options: { url: string; headers?: Record<string, string> }) => unknown;
  OTLPLogExporter: new (options: { url: string; headers?: Record<string, string> }) => unknown;
  LoggerProvider: new (options: { processors: unknown[] }) => OpenTelemetryLoggerProvider;
  BatchLogRecordProcessor: new (exporter: unknown) => unknown;
  SimpleLogRecordProcessor: new (exporter: unknown) => unknown;
  SimpleSpanProcessor: new (exporter: unknown) => unknown;
  logs: { setGlobalLoggerProvider(provider: OpenTelemetryLoggerProvider): void };
  SeverityNumber: OpenTelemetrySeverityNumber;
  getNodeAutoInstrumentations(): unknown;
  UndiciInstrumentation: new () => unknown;
};

export interface OpenTelemetryNodeServerOptions {
  endpoint?: string;
  traceEndpoint?: string;
  logEndpoint?: string;
  headers?: Record<string, string>;
  serviceName?: string;
  serverless?: boolean;
  patchConsole?: boolean;
  installSigtermHandler?: boolean;
}

export interface OpenTelemetryNodeServerRuntime {
  loggerProvider: OpenTelemetryLoggerProvider;
  sdk: OpenTelemetrySdk;
  forceFlush: () => Promise<void>;
  shutdown: () => Promise<void>;
  onRequestFinally: () => Promise<void>;
}

const importOptionalModule = async <TModule>(specifier: string): Promise<TModule> => {
  const dynamicImport = new Function("specifier", "return import(specifier)") as (specifier: string) => Promise<TModule>;
  return dynamicImport(specifier);
};

const loadOpenTelemetryModules = async (): Promise<OpenTelemetryModuleSet> => {
  const [sdkNode, traceExporter, logExporter, sdkLogs, sdkTraceBase, apiLogs, autoInstrumentations, undici] = await Promise.all([
    importOptionalModule<{ NodeSDK: OpenTelemetryModuleSet["NodeSDK"] }>("@opentelemetry/sdk-node"),
    importOptionalModule<{ OTLPTraceExporter: OpenTelemetryModuleSet["OTLPTraceExporter"] }>("@opentelemetry/exporter-trace-otlp-http"),
    importOptionalModule<{ OTLPLogExporter: OpenTelemetryModuleSet["OTLPLogExporter"] }>("@opentelemetry/exporter-logs-otlp-http"),
    importOptionalModule<{
      LoggerProvider: OpenTelemetryModuleSet["LoggerProvider"];
      BatchLogRecordProcessor: OpenTelemetryModuleSet["BatchLogRecordProcessor"];
      SimpleLogRecordProcessor: OpenTelemetryModuleSet["SimpleLogRecordProcessor"];
    }>("@opentelemetry/sdk-logs"),
    importOptionalModule<{ SimpleSpanProcessor: OpenTelemetryModuleSet["SimpleSpanProcessor"] }>("@opentelemetry/sdk-trace-base"),
    importOptionalModule<{ logs: OpenTelemetryModuleSet["logs"]; SeverityNumber: OpenTelemetryModuleSet["SeverityNumber"] }>("@opentelemetry/api-logs"),
    importOptionalModule<{ getNodeAutoInstrumentations: OpenTelemetryModuleSet["getNodeAutoInstrumentations"] }>("@opentelemetry/auto-instrumentations-node"),
    importOptionalModule<{ UndiciInstrumentation: OpenTelemetryModuleSet["UndiciInstrumentation"] }>("@opentelemetry/instrumentation-undici"),
  ]);

  return {
    NodeSDK: sdkNode.NodeSDK,
    OTLPTraceExporter: traceExporter.OTLPTraceExporter,
    OTLPLogExporter: logExporter.OTLPLogExporter,
    LoggerProvider: sdkLogs.LoggerProvider,
    BatchLogRecordProcessor: sdkLogs.BatchLogRecordProcessor,
    SimpleLogRecordProcessor: sdkLogs.SimpleLogRecordProcessor,
    SimpleSpanProcessor: sdkTraceBase.SimpleSpanProcessor,
    logs: apiLogs.logs,
    SeverityNumber: apiLogs.SeverityNumber,
    getNodeAutoInstrumentations: autoInstrumentations.getNodeAutoInstrumentations,
    UndiciInstrumentation: undici.UndiciInstrumentation,
  };
};

export const withOpenTelemetryNodeServer = async (
  options: OpenTelemetryNodeServerOptions = {},
): Promise<OpenTelemetryNodeServerRuntime> => {
  const otel = await loadOpenTelemetryModules().catch((error: unknown) => {
    throw new Error(
      "withOpenTelemetryNodeServer requires optional OpenTelemetry peer dependencies. Install @opentelemetry/sdk-node, @opentelemetry/exporter-trace-otlp-http, @opentelemetry/exporter-logs-otlp-http, @opentelemetry/sdk-logs, @opentelemetry/sdk-trace-base, @opentelemetry/api-logs, @opentelemetry/auto-instrumentations-node, and @opentelemetry/instrumentation-undici.",
      { cause: error },
    );
  });
  const endpoint = options.endpoint ?? "http://localhost:4318";
  const serviceName = options.serviceName ?? "nrpc-server";
  const serverless = options.serverless ?? Boolean(process.env.VERCEL);
  const patchConsole = options.patchConsole ?? true;
  const installSigtermHandler = options.installSigtermHandler ?? !serverless;

  const logExporter = new otel.OTLPLogExporter({
    url: options.logEndpoint ?? `${endpoint}/v1/logs`,
    headers: options.headers,
  });
  const loggerProvider = new otel.LoggerProvider({
    processors: [serverless ? new otel.SimpleLogRecordProcessor(logExporter) : new otel.BatchLogRecordProcessor(logExporter)],
  });
  otel.logs.setGlobalLoggerProvider(loggerProvider);
  const logger = loggerProvider.getLogger(serviceName);

  const traceExporter = new otel.OTLPTraceExporter({
    url: options.traceEndpoint ?? `${endpoint}/v1/traces`,
    headers: options.headers,
  });
  const sdk = new otel.NodeSDK({
    ...(serverless ? { spanProcessors: [new otel.SimpleSpanProcessor(traceExporter)] } : { traceExporter }),
    instrumentations: [otel.getNodeAutoInstrumentations(), new otel.UndiciInstrumentation()],
  });

  const emitLog = (severityNumber: number, severityText: string, args: unknown[]): void => {
    const body = args.map((arg) => {
      if (typeof arg === "string") {
        return arg;
      }
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }).join(" ");
    logger.emit({ severityNumber, severityText, body });
  };

  const nativeLog: ConsoleMethod = console.log.bind(console);
  const nativeWarn: ConsoleMethod = console.warn.bind(console);
  const nativeError: ConsoleMethod = console.error.bind(console);

  if (patchConsole) {
    console.log = (...args: unknown[]) => {
      nativeLog(...args);
      emitLog(otel.SeverityNumber.INFO, "INFO", args);
    };
    console.warn = (...args: unknown[]) => {
      nativeWarn(...args);
      emitLog(otel.SeverityNumber.WARN, "WARN", args);
    };
    console.error = (...args: unknown[]) => {
      nativeError(...args);
      emitLog(otel.SeverityNumber.ERROR, "ERROR", args);
    };
  }

  sdk.start();

  const forceFlush = async (): Promise<void> => {
    await loggerProvider.forceFlush();
  };
  const shutdown = async (): Promise<void> => {
    await Promise.all([sdk.shutdown(), loggerProvider.shutdown()]);
  };
  const runtime: OpenTelemetryNodeServerRuntime = {
    loggerProvider,
    sdk,
    forceFlush,
    shutdown,
    onRequestFinally: async () => {
      if (serverless) {
        await forceFlush().catch(console.error);
      }
    },
  };

  if (installSigtermHandler) {
    process.on("SIGTERM", () => {
      shutdown()
        .then(() => console.log("Tracing + logging terminated"))
        .catch((error: unknown) => nativeError("Error terminating telemetry", error))
        .finally(() => process.exit(0));
    });
  }

  return runtime;
};

export { createRpcMethodInvoker };
