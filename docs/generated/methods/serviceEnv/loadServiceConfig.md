# serviceEnv.loadServiceConfig

> **HTTP:** `POST /api/serviceEnv/loadServiceConfig` | **Type:** `async function serviceEnv.loadServiceConfig(options: LoadServiceConfigOptions): Promise<ServiceConfig>` | **Location:** [`../../src/index.ts:175`](../../src/index.ts:175)

## Signature

```typescript
async function serviceEnv.loadServiceConfig(options: LoadServiceConfigOptions): Promise<ServiceConfig>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `options` | `LoadServiceConfigOptions` | Yes | - |

## Returns

`ServiceConfig`

Return value

## Implementation

```typescript
(
  options: LoadServiceConfigOptions,
): ServiceConfig => ({
  port: Number.parseInt(process.env.PORT ?? String(options.defaultPort), 10),
  serviceName: options.serviceName,
  websocketEnabled: isWebsocketEnabled(),
})
```

## Dependencies

### Internal

#### `LoadServiceConfigOptions` (interface)
> **Location:** [`../../src/service-env.ts:9`](../../src/service-env.ts:9)

```typescript
export interface LoadServiceConfigOptions {
  defaultPort: number;
  serviceName: string;
}
```

#### `ServiceConfig` (interface)
> **Location:** [`../../src/service-env.ts:3`](../../src/service-env.ts:3)

```typescript
export interface ServiceConfig {
  port: number;
  serviceName: string;
  websocketEnabled: boolean;
}
```

#### `isWebsocketEnabled` (import)
> **Location:** [`../../src/service-env.ts:1`](../../src/service-env.ts:1)

```typescript
isWebsocketEnabled
```

#### `ServiceConfig` (type)

**Description:** Return type
