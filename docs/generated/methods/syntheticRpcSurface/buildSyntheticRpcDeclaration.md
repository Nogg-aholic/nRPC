# syntheticRpcSurface.buildSyntheticRpcDeclaration

> **HTTP:** `POST /api/syntheticRpcSurface/buildSyntheticRpcDeclaration` | **Type:** `async function syntheticRpcSurface.buildSyntheticRpcDeclaration(definition: SyntheticRpcSurfaceLike, options?: BuildSyntheticRpcDeclarationOptions): Promise<string>` | **Location:** [`../../src/index.ts:150`](../../src/index.ts:150)

## Signature

```typescript
async function syntheticRpcSurface.buildSyntheticRpcDeclaration(definition: SyntheticRpcSurfaceLike, options?: BuildSyntheticRpcDeclarationOptions): Promise<string>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `definition` | `SyntheticRpcSurfaceLike` | Yes | - |
| `options` | `BuildSyntheticRpcDeclarationOptions` | No | - |

## Returns

`string`

Return value

## Implementation

```typescript
export function buildSyntheticRpcDeclaration(
  definition: SyntheticRpcSurfaceLike,
  options: BuildSyntheticRpcDeclarationOptions = {},
): string {
  const lines = [
    ...(options.declarationTypesPrelude ?? []),
    ...(definition.declarationTypes ?? []),
    "",
    "declare global {",
    ...getBindings(definition).flatMap((binding) => binding.declarationLines),
    "}",
    "",
    "export {};",
  ];
  const out = lines.join("\n");
  return options.trailingNewline === false ? out : `${out}\n`;
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

#### `BuildSyntheticRpcDeclarationOptions` (type)
> **Location:** [`../../src/synthetic-rpc-surface.ts:34`](../../src/synthetic-rpc-surface.ts:34)

```typescript
export type BuildSyntheticRpcDeclarationOptions = {
  declarationTypesPrelude?: string[];
  trailingNewline?: boolean;
};
```

#### `getBindings` (function)
> **Location:** [`../../src/synthetic-rpc-surface.ts:48`](../../src/synthetic-rpc-surface.ts:48)

```typescript
function getBindings(
  definition: SyntheticRpcSurfaceLike,
): SyntheticRpcBinding[] {
  if ("bindings" in definition) {
    return definition.bindings;
  }
  return definition.globals;
}
```

#### `string` (type)

**Description:** Return type
