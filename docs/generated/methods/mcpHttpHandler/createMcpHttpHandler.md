# mcpHttpHandler.createMcpHttpHandler

> **HTTP:** `POST /api/mcpHttpHandler/createMcpHttpHandler` | **Type:** `async function mcpHttpHandler.createMcpHttpHandler(options: CreateMcpHttpHandlerOptions): Promise<(request: Request) => Promise<Response | undefined>>` | **Location:** [`../../src/index.ts:195`](../../src/index.ts:195)

## Signature

```typescript
async function mcpHttpHandler.createMcpHttpHandler(options: CreateMcpHttpHandlerOptions): Promise<(request: Request) => Promise<Response | undefined>>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `options` | `CreateMcpHttpHandlerOptions` | Yes | - |

## Returns

`(request: Request) => Promise<Response | undefined>`

Return value

## Implementation

```typescript
export function createMcpHttpHandler(
  options: CreateMcpHttpHandlerOptions,
): (request: Request) => Promise<Response | undefined> {
  const endpointPath = options.endpointPath ?? "/mcp";
  const toolsByName = new Map(
    options.tools.map((tool) => [tool.name, tool] as const),
  );

  return async (request: Request) => {
    const url = new URL(request.url);
    if (url.pathname !== endpointPath) {
      return undefined;
    }

    if (request.method === "GET") {
      return Response.json({
        name: options.serverName ?? "nRPC MCP",
        version: options.serverVersion ?? "0.1.0",
        protocol: "mcp-jsonrpc-http",
        endpoint: endpointPath,
        capabilities: {
          tools: true,
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const message = (await request.json()) as JsonRpcRequest;
    const response = await handleJsonRpcMessage(message, toolsByName, options);
    return Response.json(response, {
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    });
  };
}
```

## Dependencies

### Internal

#### `CreateMcpHttpHandlerOptions` (type)
> **Location:** [`../../src/mcp-http-handler.ts:8`](../../src/mcp-http-handler.ts:8)

```typescript
export type CreateMcpHttpHandlerOptions = {
  tools: readonly McpToolLike[];
  serverName?: string;
  serverVersion?: string;
  endpointPath?: string;
};
```

#### `JsonRpcRequest` (type)
> **Location:** [`../../src/mcp-http-handler.ts:15`](../../src/mcp-http-handler.ts:15)

```typescript
type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};
```

#### `handleJsonRpcMessage` (function)
> **Location:** [`../../src/mcp-http-handler.ts:73`](../../src/mcp-http-handler.ts:73)

```typescript
async function handleJsonRpcMessage(
  message: JsonRpcRequest,
  toolsByName: ReadonlyMap<string, McpToolLike>,
  options: CreateMcpHttpHandlerOptions,
): Promise<JsonRpcResponse> {
  const id = message.id ?? null;

  if (message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    return jsonRpcError(id, -32600, "Invalid Request");
  }

  switch (message.method) {
    case "initialize":
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: {
            name: options.serverName ?? "nRPC MCP",
            version: options.serverVersion ?? "0.1.0",
          },
          capabilities: {
            tools: {},
          },
        },
      };

    case "notifications/initialized":
      return {
        jsonrpc: "2.0",
        id,
        result: {},
      };

    case "tools/list":
      return {
        jsonrpc: "2.0",
        id,
        result: {
          tools: [...toolsByName.values()].map((tool) => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
          })),
        },
      };

    case "tools/call": {
      const toolName =
        typeof message.params?.name === "string"
          ? message.params.name
          : undefined;
      if (!toolName) {
        return jsonRpcError(id, -32602, "Missing tool name");
      }

      const tool = toolsByName.get(toolName);
      if (!tool) {
        return jsonRpcError(id, -32601, "Unknown tool: $toolName");
      }

      try {
        const args = message.params?.arguments;
        const result = await tool.handler(
          args && typeof args === "object"
            ? (args as Record<string, unknown>)
            : {},
        );
        return {
          jsonrpc: "2.0",
          id,
          result,
        };
      } catch (error) {
        return jsonRpcError(
          id,
          -32000,
          error instanceof Error ? error.message : "Tool call failed",
        );
      }
    }

    default:
      return jsonRpcError(id, -32601, "Method not found: $($message.method)");
  }
}
```

#### `(request: Request) => Promise<Response | undefined>` (type)

**Description:** Return type
