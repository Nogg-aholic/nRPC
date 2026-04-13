export const NRPC_METHOD_REF = Symbol.for('@nogg-aholic/nrpc/method-ref');

export type RpcPromiseLikeKeys = 'then' | 'catch' | 'finally';

export type RpcSymbolRef = {
  __nrpcMethodName?: string;
};

export type RpcMethodRef<Args extends any[] = any[], Result = any> =
  ((...args: Args) => Promise<Awaited<Result>>) & {
    __nrpcMethodName?: string;
    [NRPC_METHOD_REF]?: true;
  };

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

export function createNamedRpcMethodRef<TArgs extends any[] = any[], TResult = any>(
  methodName: string,
): RpcMethodRef<TArgs, TResult> {
  const ref = (async () => {
    throw new Error(`${methodName} cannot be invoked directly. Resolve it through your RPC caller.`);
  }) as RpcMethodRef<TArgs, TResult>;

  defineMethodRefMetadata(ref as object, methodName);
  return ref;
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

  const candidate = value as RpcSymbolRef & { [NRPC_METHOD_REF]?: true };
  const methodName = candidate.__nrpcMethodName;
  return typeof methodName === 'string' && methodName.length > 0 ? methodName : undefined;
}

export function isRpcMethodRef(value: unknown): value is RpcMethodRef<any[], any> {
  if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
    return false;
  }

  const candidate = value as RpcSymbolRef & { [NRPC_METHOD_REF]?: true };
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
