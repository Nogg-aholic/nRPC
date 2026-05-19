# nRPC Repository Instructions

These instructions exist to prevent regression toward older patterns that the `rpc-example` cleanup intentionally removed.

## Package Boundary

- Treat `@nogg-aholic/nrpc` as the runtime package.
- Treat `@nogg-aholic/nrpc-cli` as the development-time generation package.
- Do not move generator responsibilities back into the runtime package.
- Do not make generated runtime artifacts depend on `@nogg-aholic/nrpc-cli` at runtime.

## Example-Conformant Layout

When creating or updating examples, follow the `rpc-example` layout:

```text
scripts/
  generate.ts
src/
  service.ts
  server.ts
  client/
  generated/
```

Rules:

- generation entrypoints belong in `scripts/`
- runtime code belongs in `src/`
- generated artifacts belong in `src/generated/`
- do not reintroduce `contracts/` folders as a default pattern

## Runtime Wiring Expectations

The runtime package should support the normal endpoint set cleanly:

- `/rpc`
- `/api`
- `/docs`
- `/mcp`

Generated artifacts should plug into those endpoints with minimal hand-written glue.

## Generated Artifact Rules

- Generated docs artifacts must be self-contained.
- If a generated file needs helper logic, inline it into the generated output when appropriate.
- Do not emit imports from `nrpc-cli` into generated runtime artifacts.
- Do not emit references to undeclared helper functions or source-only types into generated files.

## OpenAPI And Derived Outputs

- Prefer canonical semantic manifest flow over duplicate route-manifest pipelines.
- Derive transport/docs/MCP outputs from canonical metadata.
- Do not emit wrapper/docs/MCP outputs unless there is a real consumer or the caller explicitly requested them.

## Example Behavior To Preserve

`rpc-example` is the reference pattern.
Do not regress these properties:

- `nrpc-cli` is a dev dependency
- generation script lives under `scripts/`
- runtime server consumes generated files from `src/generated/`
- `call-manifest.ts` demonstrates typed runtime-aware usage
- `call-noManifest.ts` demonstrates plain external-client usage without generated-manifest dependency

## Documentation Rule

Keep runtime documentation in `nRPC` and generation documentation in `nrpc-cli`.
Do not blur the two responsibilities in future docs updates.