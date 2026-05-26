import type { HttpRouteManifest } from "./http-route-runtime.js";

export type RpcNamespaceDescriptor =
  | readonly string[]
  | Pick<HttpRouteManifest, "rootPath">;

type MutableRecord = Record<string, unknown>;

function isMutableRecord(value: unknown): value is MutableRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveRootPath(descriptor: RpcNamespaceDescriptor): readonly string[] {
  return "rootPath" in descriptor ? descriptor.rootPath : descriptor;
}

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

function mergeMountedRoot(target: MutableRecord, surface: MutableRecord): void {
  for (const [key, value] of Object.entries(surface)) {
    assignMountedEntry(target, key, value);
  }
}

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
