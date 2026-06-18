# httpRouteRuntime

> **HTTP:** `POST /api/httpRouteRuntime` | **Type:** `async function httpRouteRuntime(): Promise<{ readonly createHttpRouteMatcher: (manifest: HttpRouteManifest, options?: CreateHttpRouteMatcherOptions) => (pathname: string) => HttpRouteMatch | undefined; readonly routeSupportsProtocol: (entry: HttpRouteManifestEntry, protocol: "json" | "binary") => boolean; }>` | **Location:** [`../../src/index.ts:133`](../../src/index.ts:133)

## Signature

```typescript
async function httpRouteRuntime(): Promise<{ readonly createHttpRouteMatcher: (manifest: HttpRouteManifest, options?: CreateHttpRouteMatcherOptions) => (pathname: string) => HttpRouteMatch | undefined; readonly routeSupportsProtocol: (entry: HttpRouteManifestEntry, protocol: "json" | "binary") => boolean; }>
```

## Returns

`{ readonly createHttpRouteMatcher: (manifest: HttpRouteManifest, options?: CreateHttpRouteMatcherOptions) => (pathname: string) => HttpRouteMatch | undefined; readonly routeSupportsProtocol: (entry: HttpRouteManifestEntry, protocol: "json" | "binary") => boolean; }`

Return value

## Implementation

```typescript
{
		createHttpRouteMatcher,
		routeSupportsProtocol,
	}
```

## Dependencies

### Internal

#### `{ readonly createHttpRouteMatcher: (manifest: HttpRouteManifest, options?: CreateHttpRouteMatcherOptions) => (pathname: string) => HttpRouteMatch | undefined; readonly routeSupportsProtocol: (entry: HttpRouteManifestEntry, protocol: "json" | "binary") => boolean; }` (type)

**Description:** Return type
