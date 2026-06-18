# syntheticRpcSurface.asUpstreamProxyInjectionDefinition

> **HTTP:** `POST /api/syntheticRpcSurface/asUpstreamProxyInjectionDefinition` | **Type:** `async function syntheticRpcSurface.asUpstreamProxyInjectionDefinition(definition: SyntheticRpcSurfaceLike): Promise<UpstreamProxyInjectionDefinition>` | **Location:** [`../../src/index.ts:149`](../../src/index.ts:149)

## Signature

```typescript
async function syntheticRpcSurface.asUpstreamProxyInjectionDefinition(definition: SyntheticRpcSurfaceLike): Promise<UpstreamProxyInjectionDefinition>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `definition` | `SyntheticRpcSurfaceLike` | Yes | - |

## Returns

`UpstreamProxyInjectionDefinition`

Return value

## Implementation

```typescript
export function asUpstreamProxyInjectionDefinition(
  definition: SyntheticRpcSurfaceLike,
): UpstreamProxyInjectionDefinition {
  if ("globals" in definition) {
    return definition;
  }

  return {
    id: definition.id,
    rootPath: definition.rootPath,
    declarationTypes: definition.declarationTypes,
    runtimePreludeLines: definition.runtimePreludeLines,
    globals: definition.bindings,
    declarationMarker: definition.declarationMarker,
    runtimeMarker: definition.runtimeMarker,
  };
}
```

## Dependencies

### Internal

#### `SyntheticRpcSurfaceLike` (type)
> **Location:** [`../../src/synthetic-rpc-surface.ts:30`](../../src/synthetic-rpc-surface.ts:30)

```typescript
type SyntheticRpcSurfaceLike =
  | SyntheticRpcSurfaceDefinition
  | UpstreamProxyInjectionDefinition;
```

#### `UpstreamProxyInjectionDefinition` (type)
> **Location:** [`../../src/synthetic-rpc-surface.ts:23`](../../src/synthetic-rpc-surface.ts:23)

```typescript
export type UpstreamProxyInjectionDefinition = Omit<
  SyntheticRpcSurfaceDefinition,
  "bindings"
> & {
  globals: UpstreamProxyInjectedGlobal[];
};
```

#### `UpstreamProxyInjectionDefinition` (type)

**Description:** Return type
