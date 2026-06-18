# serviceComposition.mountRpcNamespace

> **HTTP:** `POST /api/serviceComposition/mountRpcNamespace` | **Type:** `async function serviceComposition.mountRpcNamespace(target: TTarget, descriptor: RpcNamespaceDescriptor, surface: TSurface): Promise<TTarget>` | **Location:** [`../../src/index.ts:183`](../../src/index.ts:183)

## Signature

```typescript
async function serviceComposition.mountRpcNamespace(target: TTarget, descriptor: RpcNamespaceDescriptor, surface: TSurface): Promise<TTarget>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `target` | `TTarget` | Yes | - |
| `descriptor` | `RpcNamespaceDescriptor` | Yes | - |
| `surface` | `TSurface` | Yes | - |

## Returns

`TTarget`

Return value

## Implementation

```typescript
export function mountRpcNamespace<TTarget extends MutableRecord, TSurface>(
  target: TTarget,
  descriptor: RpcNamespaceDescriptor,
  surface: TSurface,
): TTarget {
  const rootPath = resolveRootPath(descriptor).filter((segment) => segment.length > 0);

  if (rootPath.length === 0) {
    if (!isMutableRecord(surface)) {
      throw new Error(
        "Cannot mount an RPC namespace with an empty rootPath unless the surface is an object.",
      );
    }

    mergeMountedRoot(target, surface);
    return target;
  }

  let cursor: MutableRecord = target;
  for (const segment of rootPath.slice(0, -1)) {
    const existing = cursor[segment];
    if (existing === undefined) {
      const next: MutableRecord = {};
      cursor[segment] = next;
      cursor = next;
      continue;
    }

    if (!isMutableRecord(existing)) {
      throw new Error(
        `Cannot mount RPC namespace at ${rootPath.join(".")}: ${segment} is not an object.`,
      );
    }

    cursor = existing;
  }

  assignMountedEntry(cursor, rootPath[rootPath.length - 1]!, surface);
  return target;
}
```

## Dependencies

### Internal

#### `MutableRecord` (type)
> **Location:** [`../../src/service-composition.ts:7`](../../src/service-composition.ts:7)

```typescript
type MutableRecord = Record<string, unknown>;
```

#### `RpcNamespaceDescriptor` (type)
> **Location:** [`../../src/service-composition.ts:3`](../../src/service-composition.ts:3)

```typescript
export type RpcNamespaceDescriptor =
  | readonly string[]
  | Pick<HttpRouteManifest, "rootPath">;
```

#### `resolveRootPath` (function)
> **Location:** [`../../src/service-composition.ts:13`](../../src/service-composition.ts:13)

```typescript
function resolveRootPath(descriptor: RpcNamespaceDescriptor): readonly string[] {
  return "rootPath" in descriptor ? descriptor.rootPath : descriptor;
}
```

#### `isMutableRecord` (function)
> **Location:** [`../../src/service-composition.ts:9`](../../src/service-composition.ts:9)

```typescript
function isMutableRecord(value: unknown): value is MutableRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
```

#### `mergeMountedRoot` (function)
> **Location:** [`../../src/service-composition.ts:30`](../../src/service-composition.ts:30)

```typescript
function mergeMountedRoot(target: MutableRecord, surface: MutableRecord): void {
  for (const [key, value] of Object.entries(surface)) {
    assignMountedEntry(target, key, value);
  }
}
```

#### `assignMountedEntry` (function)
> **Location:** [`../../src/service-composition.ts:17`](../../src/service-composition.ts:17)

```typescript
function assignMountedEntry(
  target: MutableRecord,
  key: string,
  value: unknown,
): void {
  const existing = target[key];
  if (existing !== undefined && existing !== value) {
    throw new Error(`Cannot mount RPC namespace at ${key}: target already exists.`);
  }

  target[key] = value;
}
```

#### `TTarget` (type)

**Description:** Return type
