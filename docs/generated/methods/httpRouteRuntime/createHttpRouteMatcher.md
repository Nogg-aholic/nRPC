# httpRouteRuntime.createHttpRouteMatcher

> **HTTP:** `POST /api/httpRouteRuntime/createHttpRouteMatcher` | **Type:** `async function httpRouteRuntime.createHttpRouteMatcher(manifest: HttpRouteManifest, options?: CreateHttpRouteMatcherOptions): Promise<(pathname: string) => HttpRouteMatch | undefined>` | **Location:** [`../../src/index.ts:134`](../../src/index.ts:134)

## Signature

```typescript
async function httpRouteRuntime.createHttpRouteMatcher(manifest: HttpRouteManifest, options?: CreateHttpRouteMatcherOptions): Promise<(pathname: string) => HttpRouteMatch | undefined>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `manifest` | `HttpRouteManifest` | Yes | - |
| `options` | `CreateHttpRouteMatcherOptions` | No | - |

## Returns

`(pathname: string) => HttpRouteMatch | undefined`

Return value

## Implementation

```typescript
export function createHttpRouteMatcher(
  manifest: HttpRouteManifest,
  options: CreateHttpRouteMatcherOptions = {},
): (pathname: string) => HttpRouteMatch | undefined {
  const defaultProtocol = options.defaultProtocol ?? "json";
  const binarySuffix = normalizeSuffix(options.binarySuffix ?? ".nrpc");
  const jsonSuffix = normalizeSuffix(options.jsonSuffix ?? ".json");
  const lookup = new Map<string, HttpRouteManifestEntry>();
  for (const route of manifest.routes) {
    lookup.set(normalizeHttpPath(route.httpPath), route);
  }

  return (pathname: string) => {
    const normalizedPath = normalizeHttpPath(pathname);
    const binaryPath = stripSuffix(normalizedPath, binarySuffix);
    if (binaryPath) {
      const entry = lookup.get(binaryPath);
      if (entry && routeSupportsProtocol(entry, "binary")) {
        return { entry, relativePath: binaryPath, protocol: "binary" };
      }
    }
    const jsonPath = stripSuffix(normalizedPath, jsonSuffix);
    if (jsonPath) {
      const entry = lookup.get(jsonPath);
      if (entry && routeSupportsProtocol(entry, "json")) {
        return { entry, relativePath: jsonPath, protocol: "json" };
      }
    }
    const entry = lookup.get(normalizedPath);
    if (entry && routeSupportsProtocol(entry, defaultProtocol)) {
      return { entry, relativePath: normalizedPath, protocol: defaultProtocol };
    }
    
    // Fallback for root-level functions (e.g., "/health")
    // Check if the normalized path matches any route's httpPath directly
    for (const route of manifest.routes) {
      if (normalizeHttpPath(route.httpPath) === normalizedPath && routeSupportsProtocol(route, defaultProtocol)) {
        return { entry: route, relativePath: normalizedPath, protocol: defaultProtocol };
      }
    }
    
    return undefined;
  };
}
```

## Dependencies

### Internal

#### `HttpRouteManifest` (type)
> **Location:** [`../../src/http-route-runtime.ts:18`](../../src/http-route-runtime.ts:18)

```typescript
export type HttpRouteManifest = {
  id: string;
  rootPath: string[];
  basePath: string;
  protocolMode: HttpProtocolMode;
  routes: HttpRouteManifestEntry[];
};
```

#### `CreateHttpRouteMatcherOptions` (type)
> **Location:** [`../../src/http-route-runtime.ts:32`](../../src/http-route-runtime.ts:32)

```typescript
export type CreateHttpRouteMatcherOptions = {
  defaultProtocol?: "binary" | "json";
  binarySuffix?: string;
  jsonSuffix?: string;
};
```

#### `HttpRouteMatch` (type)
> **Location:** [`../../src/http-route-runtime.ts:26`](../../src/http-route-runtime.ts:26)

```typescript
export type HttpRouteMatch = {
  entry: HttpRouteManifestEntry;
  relativePath: string;
  protocol: "binary" | "json";
};
```

#### `normalizeSuffix` (function)
> **Location:** [`../../src/http-route-runtime.ts:103`](../../src/http-route-runtime.ts:103)

```typescript
function normalizeSuffix(value: string): string {
  if (!value) return "";
  return value.startsWith(".") ? value : `.${value}`;
}
```

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

#### `normalizeHttpPath` (function)
> **Location:** [`../../src/http-route-runtime.ts:94`](../../src/http-route-runtime.ts:94)

```typescript
function normalizeHttpPath(value: string): string {
  const normalized = value.replace(/\\/g, "/").trim();
  if (!normalized || normalized === "/") return "/";
  const withLeadingSlash = normalized.startsWith("/")
    ? normalized
    : `/${normalized}`;
  return withLeadingSlash.replace(/\/+$/g, "") || "/";
}
```

#### `stripSuffix` (function)
> **Location:** [`../../src/http-route-runtime.ts:108`](../../src/http-route-runtime.ts:108)

```typescript
function stripSuffix(pathname: string, suffix: string): string | undefined {
  if (!suffix || !pathname.endsWith(suffix)) return undefined;
  const trimmed = pathname.slice(0, -suffix.length);
  return trimmed.length === 0 ? "/" : trimmed;
}
```

#### `routeSupportsProtocol` (function)
> **Location:** [`../../src/http-route-runtime.ts:87`](../../src/http-route-runtime.ts:87)

```typescript
export function routeSupportsProtocol(
  entry: HttpRouteManifestEntry,
  protocol: "binary" | "json",
): boolean {
  return entry.protocolMode === "both" || entry.protocolMode === protocol;
}
```

#### `(pathname: string) => HttpRouteMatch | undefined` (type)

**Description:** Return type
