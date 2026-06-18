# serviceBunServer.startBunRpcServer

> **HTTP:** `POST /api/serviceBunServer/startBunRpcServer` | **Type:** `async function serviceBunServer.startBunRpcServer(options: StartBunRpcServerOptions): Promise<void>` | **Location:** [`../../src/index.ts:192`](../../src/index.ts:192)

## Signature

```typescript
async function serviceBunServer.startBunRpcServer(options: StartBunRpcServerOptions): Promise<void>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `options` | `StartBunRpcServerOptions` | Yes | - |

## Returns

`void`

Return value

## Implementation

```typescript
(options: StartBunRpcServerOptions): void => {
  const rpcPath = options.rpcPath ?? "/rpc";
  const websocketPath = options.websocketPath ?? `${rpcPath}/ws`;

  Bun.serve({
    port: options.config.port,
    fetch(request, server) {
      if (
        options.config.websocketEnabled &&
        new URL(request.url).pathname === websocketPath
      ) {
        const upgraded = server.upgrade(request);
        if (upgraded) {
          return;
        }

        return new Response("websocket upgrade required", { status: 426 });
      }

      return options.fetchHandler(request);
    },
    websocket: {
      async message(ws, message) {
        if (!options.config.websocketEnabled) {
          ws.close(1008, "websocket mode disabled");
          return;
        }

        await handleRpcWebSocketMessage(ws, message, options.invokeRpcMethod);
      },
    },
  });

  console.log(
    `${options.config.serviceName} listening on http://127.0.0.1:${String(options.config.port)}`,
  );
  console.log(
    `RPC endpoint: http://127.0.0.1:${String(options.config.port)}${rpcPath}`,
  );
  if (options.config.websocketEnabled) {
    console.log(
      `RPC websocket endpoint: ws://127.0.0.1:${String(options.config.port)}${websocketPath}`,
    );
  }
}
```

## Dependencies

### Internal

#### `StartBunRpcServerOptions` (interface)
> **Location:** [`../../src/service-bun-server.ts:6`](../../src/service-bun-server.ts:6)

```typescript
export interface StartBunRpcServerOptions {
  config: ServiceConfig;
  fetchHandler: (request: Request) => Promise<Response>;
  invokeRpcMethod: RpcMethodInvoker;
  rpcPath?: string;
  websocketPath?: string;
}
```

#### `handleRpcWebSocketMessage` (import)
> **Location:** [`../../src/service-bun-server.ts:4`](../../src/service-bun-server.ts:4)

```typescript
handleRpcWebSocketMessage
```

#### `void` (type)

**Description:** Return type
