# nodeServer.withOpenTelemetryNodeServer

> **HTTP:** `POST /api/nodeServer/withOpenTelemetryNodeServer` | **Type:** `async function nodeServer.withOpenTelemetryNodeServer(options?: OpenTelemetryNodeServerOptions): Promise<OpenTelemetryNodeServerRuntime>` | **Location:** [`../../src/index.ts:201`](../../src/index.ts:201)

## Signature

```typescript
async function nodeServer.withOpenTelemetryNodeServer(options?: OpenTelemetryNodeServerOptions): Promise<OpenTelemetryNodeServerRuntime>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `options` | `OpenTelemetryNodeServerOptions` | No | - |

## Returns

`OpenTelemetryNodeServerRuntime`

Return value

## Implementation

```typescript
async (
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
}
```

## Dependencies

### Internal

#### `OpenTelemetryNodeServerOptions` (interface)
> **Location:** [`../../src/node-server.ts:270`](../../src/node-server.ts:270)

```typescript
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
```

#### `OpenTelemetryNodeServerRuntime` (interface)
> **Location:** [`../../src/node-server.ts:281`](../../src/node-server.ts:281)

```typescript
export interface OpenTelemetryNodeServerRuntime {
  loggerProvider: OpenTelemetryLoggerProvider;
  sdk: OpenTelemetrySdk;
  forceFlush: () => Promise<void>;
  shutdown: () => Promise<void>;
  onRequestFinally: () => Promise<void>;
}
```

#### `loadOpenTelemetryModules` (variable)
> **Location:** [`../../src/node-server.ts:294`](../../src/node-server.ts:294)

```typescript
loadOpenTelemetryModules = async (): Promise<OpenTelemetryModuleSet> => {
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
}
```

#### `ConsoleMethod` (type)
> **Location:** [`../../src/node-server.ts:233`](../../src/node-server.ts:233)

```typescript
type ConsoleMethod = (...args: unknown[]) => void;
```

#### `OpenTelemetryNodeServerRuntime` (type)

**Description:** Return type
