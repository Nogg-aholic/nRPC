# httpRouteRuntime.routeSupportsProtocol

> **HTTP:** `POST /api/httpRouteRuntime/routeSupportsProtocol` | **Type:** `async function httpRouteRuntime.routeSupportsProtocol(entry: HttpRouteManifestEntry, protocol: "binary" | "json"): Promise<boolean>` | **Location:** [`../../src/index.ts:135`](../../src/index.ts:135)

## Signature

```typescript
async function httpRouteRuntime.routeSupportsProtocol(entry: HttpRouteManifestEntry, protocol: "binary" | "json"): Promise<boolean>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `entry` | `HttpRouteManifestEntry` | Yes | - |
| `protocol` | `"binary" | "json"` | Yes | - |

## Returns

`boolean`

Return value

## Implementation

```typescript
export function routeSupportsProtocol(
  entry: HttpRouteManifestEntry,
  protocol: "binary" | "json",
): boolean {
  return entry.protocolMode === "both" || entry.protocolMode === protocol;
}
```

## Dependencies

### Internal

#### `HttpRouteManifestEntry` (type)
> **Location:** [`../../src/http-route-runtime.ts:5`](../../src/http-route-runtime.ts:5)

```typescript
export type HttpRouteManifestEntry = {
  methodName: string;
  pathParts: string[];
  httpPath: string;
  codecLookupKey: string;
  protocolMode: HttpProtocolMode;
  parameterNames?: string[];
  parameterOptionalFlags?: boolean[];
  parameterRestFlags?: boolean[];
  argsTypeReference?: string;
  resultTypeReference?: string;
};
```

#### `boolean` (type)

**Description:** Return type
