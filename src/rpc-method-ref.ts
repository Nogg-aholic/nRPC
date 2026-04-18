export const NRPC_METHOD_REF = Symbol.for('@nogg-aholic/nrpc/method-ref');
export const NRPC_METHOD_CODEC = Symbol.for('@nogg-aholic/nrpc/method-codec');
export const NRPC_METHOD_CALLER = Symbol.for('@nogg-aholic/nrpc/method-caller');

import type { RpcMethodCodec } from './types.js';

export type RpcPromiseLikeKeys = 'then' | 'catch' | 'finally';

type RpcMethodRefMetadata = {
  __nrpcMethodName?: string;
  [NRPC_METHOD_REF]?: true;
  [NRPC_METHOD_CODEC]?: RpcMethodCodec<any[], any>;
  [NRPC_METHOD_CALLER]?: RpcMethodCaller;
};

export type RpcSymbolRef = RpcMethodRefMetadata | RpcMethodRef<any[], any>;

export type RpcMethodRef<Args extends any[] = any[], Result = any> =
  ((...args: Args) => Promise<Awaited<Result>>) & RpcMethodRefMetadata;
export type RpcMethodCodecFromRef<TMethod extends RpcMethodRef<any[], any>> =
  TMethod extends RpcMethodRef<infer Args, infer Result>
    ? RpcMethodCodec<Args, Result>
    : never;
export type RpcMethodRefFromCallable<TCallable extends (...args: any[]) => Promise<any>> =
  RpcMethodRef<Parameters<TCallable>, Awaited<ReturnType<TCallable>>>;
export type RpcMethodCallerFromCallable<TCallable extends (...args: any[]) => Promise<any>> =
  (method: RpcMethodRefFromCallable<TCallable>, ...args: Parameters<TCallable>) => ReturnType<TCallable>;
export type RpcMethodCaller = <TArgs extends any[] = any[], TResult = any>(
  method: RpcMethodRef<TArgs, TResult>,
  ...args: TArgs
) => Promise<TResult>;
/*
type __nojsxPromiseLikeKeys = 'then' | 'catch' | 'finally';
type __nojsxRpcify<T> =
  T extends (...args: infer A) => infer R
    ? ((...args: A) => Promise<Awaited<R>>) & { __nojsxRpcName?: string }
    : T extends object
      ? { [K in keyof T as K extends __nojsxPromiseLikeKeys ? never : K]: __nojsxRpcify<T[K]> }
      : T;
*/
export type Rpcify<T> =
  T extends (...args: infer A) => infer R
    ? RpcMethodRef<A, R>
    : T extends object
      ? { [K in keyof T as K extends RpcPromiseLikeKeys ? never : K]: Rpcify<T[K]> }
      : T;

function defineMethodRefMetadata(target: object, methodName: string): void {
  Object.defineProperty(target, '__nrpcMethodName', {
    value: methodName,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  Object.defineProperty(target, NRPC_METHOD_REF, {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });
}

export function attachRpcMethodMetadata<T extends object>(target: T, methodName: string): T {
  defineMethodRefMetadata(target, methodName);
  return target;
}

function defineMethodCodecMetadata(target: object, codec: RpcMethodCodec<any[], any>): void {
  Object.defineProperty(target, NRPC_METHOD_CODEC, {
    value: codec,
    enumerable: false,
    configurable: false,
    writable: false,
  });
}

export function createNamedRpcMethodRef<TArgs extends any[] = any[], TResult = any>(
  methodName: string,
): RpcMethodRef<TArgs, TResult> {
  const ref = (async () => {
    throw new Error(`${methodName} cannot be invoked directly. Resolve it through your RPC caller.`);
  }) as RpcMethodRef<TArgs, TResult>;

  defineMethodRefMetadata(ref as object, methodName);
  return ref;
}

export function defineRpcMethodRef<TCallable extends (...args: any[]) => Promise<any>>(
  callable: TCallable,
): RpcMethodRefFromCallable<TCallable> {
  return callable as RpcMethodRefFromCallable<TCallable>;
}

export function withRpcMethodCodec<TArgs extends any[] = any[], TResult = any>(
  methodRef: RpcMethodRef<TArgs, TResult>,
  codec: RpcMethodCodec<TArgs, TResult>,
): RpcMethodRef<TArgs, TResult> {
  defineMethodCodecMetadata(methodRef as object, codec as RpcMethodCodec<any[], any>);
  return methodRef;
}

export type RpcMethodCodecResolver = (methodName: string) => RpcMethodCodec<any[], any> | undefined;

export type CreateEndpointSurfaceOptions = {
  codecResolver?: RpcMethodCodecResolver;
  methodFactory?: (methodName: string) => RpcMethodRef<any[], any>;
  caller?: RpcMethodCaller;
};

export function createEndpointSurface<T>(
  pathParts: string[] = [],
  options: CreateEndpointSurfaceOptions = {},
): Rpcify<T> {
  const cache = new Map<string, unknown>();
  const { codecResolver, methodFactory, caller } = options;

  const build = (parts: string[]): unknown => {
    const cacheKey = parts.join('.');
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const target = cacheKey.length > 0
      ? (methodFactory?.(cacheKey) ?? createNamedRpcMethodRef(cacheKey))
      : function () {};

    const proxy = new Proxy(target, {
      get(_target, property) {
        if (property === '__nrpcMethodName') {
          return cacheKey;
        }
        if (property === NRPC_METHOD_REF) {
          return true;
        }
        if (property === NRPC_METHOD_CODEC) {
          return cacheKey.length > 0 ? codecResolver?.(cacheKey) : undefined;
        }
        if (property === 'then' && cacheKey.length === 0) {
          return undefined;
        }
        if (typeof property === 'symbol') {
          return undefined;
        }
        return build([...parts, String(property)]);
      },
      apply(target, _thisArg, argArray) {
        if (cacheKey.length === 0) {
          throw new Error('RPC surface root cannot be invoked directly.');
        }
        if (!caller) {
          throw new Error(`RPC reference ${cacheKey} cannot be invoked directly. Bind a caller or resolve it through your RPC caller.`);
        }
        return caller(target as RpcMethodRef<any[], any>, ...(argArray as any[]));
      },
    });

    cache.set(cacheKey, proxy);
    return proxy;
  };

  return build(pathParts) as Rpcify<T>;
}

export function createRpcCodecRegistry(entries: Iterable<readonly [string, RpcMethodCodec<any[], any>]>): RpcMethodCodecResolver {
  const registry = new Map<string, RpcMethodCodec<any[], any>>(entries);
  return (methodName: string) => registry.get(methodName);
}

export function defineEndpointSurface<T extends object>(surface: T): T {
  return surface;
}

export function attachRpcCaller<T>(surface: T, caller: RpcMethodCaller): T {
  const seen = new WeakMap<object, unknown>();

  const bind = (value: unknown): unknown => {
    if (typeof value === 'function') {
      const methodName = getRpcMethodName(value);
      if (!methodName) {
        return value;
      }

      const existing = seen.get(value as object);
      if (existing) {
        return existing;
      }

      (value as RpcMethodRefMetadata)[NRPC_METHOD_CALLER] = caller;
      seen.set(value as object, value);
      return value;
    }

    if (!value || typeof value !== 'object') {
      return value;
    }

    const existing = seen.get(value as object);
    if (existing) {
      return existing;
    }

    const out: Record<string, unknown> | unknown[] = Array.isArray(value) ? [] : {};
    seen.set(value as object, out);
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      (out as Record<string, unknown>)[key] = bind(entry);
    }
    return out;
  };

  return bind(surface) as T;
}

export function createRpcCodecResolverFromSurface(surface: unknown): RpcMethodCodecResolver {
  const registry = new Map<string, RpcMethodCodec<any[], any>>();

  const visit = (value: unknown): void => {
    if (typeof value === 'function') {
      const methodName = getRpcMethodName(value);
      const codec = getRpcMethodCodec(value);
      if (methodName && codec) {
        registry.set(methodName, codec);
      }
      return;
    }

    if (!value || typeof value !== 'object') {
      return;
    }

    for (const entry of Object.values(value as Record<string, unknown>)) {
      visit(entry);
    }
  };

  visit(surface);
  return (methodName: string) => registry.get(methodName);
}

export function createRpcProxy<T>(pathParts: string[] = []): Rpcify<T> {
  const cache = new Map<string, unknown>();

  const build = (parts: string[]): unknown => {
    const cacheKey = parts.join('.');
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const proxy = new Proxy(function () {}, {
      get(_target, property) {
        if (property === '__nrpcMethodName') {
          return cacheKey;
        }
        if (property === NRPC_METHOD_REF) {
          return true;
        }
        if (property === 'then' && cacheKey.length === 0) {
          return undefined;
        }
        if (typeof property === 'symbol') {
          return undefined;
        }
        return build([...parts, String(property)]);
      },
      apply() {
        throw new Error(`RPC reference ${cacheKey || '<root>'} cannot be invoked directly. Resolve it through your RPC caller.`);
      },
    });

    cache.set(cacheKey, proxy);
    return proxy;
  };

  return build(pathParts) as Rpcify<T>;
}

export function getRpcMethodName(value: unknown): string | undefined {
  if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
    return undefined;
  }

  const candidate = value as RpcMethodRefMetadata;
  const methodName = candidate.__nrpcMethodName;
  return typeof methodName === 'string' && methodName.length > 0 ? methodName : undefined;
}

export function getRpcMethodCodec<Args extends any[] = any[], Result = any>(value: unknown): RpcMethodCodec<Args, Result> | undefined {
  if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
    return undefined;
  }

  const candidate = value as RpcMethodRefMetadata;
  const codec = candidate[NRPC_METHOD_CODEC];
  return codec as RpcMethodCodec<Args, Result> | undefined;
}

export function isRpcMethodRef(value: unknown): value is RpcMethodRef<any[], any> {
  if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
    return false;
  }

  const candidate = value as RpcMethodRefMetadata;
  return candidate[NRPC_METHOD_REF] === true || typeof candidate.__nrpcMethodName === 'string';
}

export function serializeRpcMethodRefs(value: unknown): unknown {
  const methodName = getRpcMethodName(value);
  if (methodName) {
    return { __nrpcMethodName: methodName };
  }

  if (Array.isArray(value)) {
    return value.map((entry) => serializeRpcMethodRefs(entry));
  }

  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      out[key] = serializeRpcMethodRefs(entry);
    }
    return out;
  }

  return value;
}
