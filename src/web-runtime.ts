import {
  decodeRpcAwaitMethodName,
  decodeRpcReturnMessage,
  decodeRpcReturnMessageWithCodec,
  decodeRpcAwaitMessageWithCodec,
  encodeRpcAwaitMessageWithCodec,
  encodeRpcReturnMessage,
  encodeRpcReturnMessageWithCodec,
} from "./rpc-frame.js";
import { decodeRpcValue } from "./value-codec.js";
import { createEndpointSurface } from "./rpc-method-ref.js";
import {
  createHttpRouteMatcher,
  type HttpRouteMatch,
  type HttpRouteManifest,
  routeSupportsProtocol,
  type RpcCodecResolver,
} from "./http-route-runtime.js";
import type { RpcMethodCodec } from "./types.js";
import {
  getRpcMethodCodec,
  getRpcMethodName,
  NRPC_METHOD_CODEC,
  NRPC_METHOD_REF,
  type RpcMethodRef,
} from "./rpc-method-ref.js";

export type RpcClientSurface<T> = T extends (...args: infer A) => infer R
  ? (...args: [...A, RpcCallRequestOptions?]) => Promise<Awaited<R>>
  : T extends object
    ? { [K in keyof T]: RpcClientSurface<T[K]> }
    : T;

export type RpcMethodInvoker = (
  methodName: string,
  args: readonly unknown[],
) => unknown | Promise<unknown>;

export type ResolveRpcMethodOptions = {
  separator?: string;
  allowEmptySegments?: boolean;
};

export type CreateRpcFetchHandlerOptions = {
  codecResolver: RpcCodecResolver;
  invokeMethod: RpcMethodInvoker;
  awaitEventCode: number;
  returnEventCode: number;
  errorStatus?: number;
  transformError?: (error: unknown) => unknown;
  successResponseFactory?: (context: RpcFetchSuccessContext) => Response;
  errorResponseFactory?: (context: RpcFetchErrorContext) => Response;
};

export type SyntheticJsonResponseFactory = (
  result: unknown,
  match: SyntheticRouteInvocation,
) => Response;

export type SyntheticBinaryResponseFactory = (
  context: SyntheticBinaryResponseContext,
) => Response;

export type CreateSyntheticHttpRouteHandlerOptions = {
  manifest: HttpRouteManifest;
  codecResolver: RpcCodecResolver;
  invokeMethod: RpcMethodInvoker;
  defaultJsonEnvelope?: boolean;
  jsonResponseFactory?: SyntheticJsonResponseFactory;
  binaryResponseFactory?: SyntheticBinaryResponseFactory;
};

export type SyntheticRouteInvocation = {
  methodName: string;
  args: readonly unknown[];
  match: HttpRouteMatch;
};

export type RpcFetchSuccessContext = {
  request: Request;
  frame: ReturnType<typeof decodeRpcAwaitMessageWithCodec>;
  codec: RpcMethodCodec<any[], any> | undefined;
  result: unknown;
  payload: Uint8Array;
};

export type RpcFetchErrorContext = {
  request: Request;
  error: unknown;
  payload: Uint8Array;
  status: number;
  transformedError: unknown;
  returnEventCode: number;
};

export type SyntheticBinaryResponseContext = {
  request: Request;
  match: HttpRouteMatch;
  codec: RpcMethodCodec<any[], any>;
  result: unknown;
  payload: Uint8Array;
};

export type FetchRpcCallerOptions = {
  endpoint: string;
  awaitEventCode: number;
  returnEventCode: number;
  fetch?: typeof fetch;
  codecResolver?: (
    methodName: string,
  ) => RpcMethodCodec<any[], any> | undefined;
  requestInitFactory?: (context: FetchRpcRequestContext) => RequestInit;
};

export type FetchRpcRequestContext = {
  requestId: number;
  methodName: string;
  args: readonly unknown[];
  codec: RpcMethodCodec<any[], any> | undefined;
  payload: Uint8Array;
  requestOptions?: RpcCallRequestOptions;
};

export type SyntheticRouteCallerOptions = {
  manifest: HttpRouteManifest;
  fetch?: typeof fetch;
  codecResolver?: RpcCodecResolver;
  jsonRequestInitFactory?: (
    context: SyntheticJsonRequestContext,
  ) => RequestInit;
  binaryRequestInitFactory?: (
    context: SyntheticBinaryRequestContext,
  ) => RequestInit;
  jsonResponseParser?: <TResult>(
    response: Response,
    context: SyntheticJsonRequestContext,
  ) => Promise<TResult>;
};

export type CreateSyntheticRouteSurfaceOptions = SyntheticRouteCallerOptions & {
  rootPath?: string[];
  codecResolver?: (
    methodName: string,
  ) => RpcMethodCodec<any[], any> | undefined;
  protocol?: "json" | "binary";
};

export type RpcCallRequestOptions = {
  headers?: HeadersInit;
  requestInit?: Omit<RequestInit, "body" | "method">;
};

export type RpcClientSurfaceWithOptions<T> = RpcClientSurface<T>;

export type SyntheticJsonRequestContext = {
  route: HttpRouteMatch["entry"];
  methodName: string;
  args: readonly unknown[];
  url: string;
  body: unknown;
  requestOptions?: RpcCallRequestOptions;
};

export type SyntheticBinaryRequestContext = SyntheticJsonRequestContext & {
  codec: RpcMethodCodec<any[], any>;
  payload: Uint8Array;
};

const NRPC_REQUEST_OPTIONS = Symbol.for("@nogg-aholic/nrpc/request-options");

type RpcMethodRefWithRequestOptions = RpcMethodRef<any[], any> & {
  [NRPC_REQUEST_OPTIONS]?: RpcCallRequestOptions;
};

function isRpcCallRequestOptions(
  value: unknown,
): value is RpcCallRequestOptions {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return "headers" in candidate || "requestInit" in candidate;
}

function extractRpcCallRequestOptions(args: readonly unknown[]): {
  args: readonly unknown[];
  requestOptions?: RpcCallRequestOptions;
} {
  if (args.length === 0) {
    return { args };
  }

  const last = args[args.length - 1];
  if (!isRpcCallRequestOptions(last)) {
    return { args };
  }

  return {
    args: args.slice(0, -1),
    requestOptions: last,
  };
}

export function resolveRpcMethod(
  target: unknown,
  methodName: string,
  options: ResolveRpcMethodOptions = {},
): (...args: any[]) => unknown {
  const separator = options.separator ?? ".";
  const path = methodName
    .split(separator)
    .filter((segment) =>
      options.allowEmptySegments ? true : segment.length > 0,
    );
  let cursor: unknown = target;
  for (const part of path) {
    cursor = (cursor as Record<string, unknown> | undefined)?.[part];
  }
  if (typeof cursor !== "function") {
    throw new Error(`Unknown RPC method: ${methodName}`);
  }
  return cursor as (...args: any[]) => unknown;
}

export function createRpcMethodInvoker(
  target: unknown,
  options?: ResolveRpcMethodOptions,
): RpcMethodInvoker {
  return async (methodName, args) => {
    const method = resolveRpcMethod(target, methodName, options);
    return method(...args);
  };
}

export function createRpcFetchRequestHandler(
  options: CreateRpcFetchHandlerOptions,
): (request: Request) => Promise<Response> {
  const errorStatus = options.errorStatus ?? 500;
  const transformError = options.transformError ?? defaultErrorTransformer;
  const successResponseFactory =
    options.successResponseFactory ??
    ((context) =>
      new Response(toBodyBuffer(context.payload), {
        headers: {
          "content-type": "application/octet-stream",
        },
      }));
  const errorResponseFactory =
    options.errorResponseFactory ??
    ((context) =>
      new Response(toBodyBuffer(context.payload), {
        status: context.status,
        headers: {
          "content-type": "application/octet-stream",
        },
      }));

  return async (request: Request) => {
    const body = await readRequestBytes(request);
    try {
      const methodName = decodeRpcAwaitMethodName(body, options.awaitEventCode);
      const codec = options.codecResolver(methodName);
      const frame = decodeRpcAwaitMessageWithCodec(
        body,
        codec,
        options.awaitEventCode,
      );
      const args = Array.isArray(frame.args) ? frame.args : [];
      const result = await options.invokeMethod(frame.methodName, args);
      const payload = codec
        ? encodeRpcReturnMessageWithCodec(
            options.returnEventCode,
            frame.requestId,
            true,
            result,
            codec,
          )
        : encodeRpcReturnMessage(
            options.returnEventCode,
            frame.requestId,
            true,
            result,
          );
      return successResponseFactory({ request, frame, codec, result, payload });
    } catch (error) {
      const transformedError = transformError(error);
      const payload = encodeRpcReturnMessage(
        options.returnEventCode,
        0,
        false,
        transformedError,
      );
      return errorResponseFactory({
        request,
        error,
        payload,
        status: errorStatus,
        transformedError,
        returnEventCode: options.returnEventCode,
      });
    }
  };
}

export function createSyntheticHttpRouteHandler(
  options: CreateSyntheticHttpRouteHandlerOptions,
): (request: Request) => Promise<Response | undefined> {
  const matchRoute = createHttpRouteMatcher(options.manifest);
  const jsonResponseFactory =
    options.jsonResponseFactory ??
    ((result, invocation) => {
      if (options.defaultJsonEnvelope === false) {
        return Response.json(result);
      }
      return Response.json({
        ok: true,
        method: invocation.methodName,
        result,
      });
    });
  const binaryResponseFactory =
    options.binaryResponseFactory ??
    ((context) =>
      new Response(toBodyBuffer(context.payload), {
        headers: {
          "content-type": "application/octet-stream",
          "x-nrpc-method": context.match.entry.methodName,
        },
      }));

  return async (request: Request) => {
    if (request.method !== "POST") {
      return undefined;
    }

    const match = matchRoute(new URL(request.url).pathname);
    if (!match) {
      return undefined;
    }

    const codec = options.codecResolver(match.entry.codecLookupKey);
    const args =
      match.protocol === "binary"
        ? await readBinaryArgs(request, codec)
        : await readJsonArgs(request, match.entry);
    const result = await options.invokeMethod(match.entry.methodName, args);

    if (match.protocol === "binary") {
      if (!codec?.result) {
        throw new Error(`Missing result codec for ${match.entry.methodName}`);
      }
      const payload = codec.result.encode(result);
      return binaryResponseFactory({ request, match, codec, result, payload });
    }

    return jsonResponseFactory(result, {
      methodName: match.entry.methodName,
      args,
      match,
    });
  };
}

export function createFetchRpcCaller(options: FetchRpcCallerOptions) {
  const fetchImpl = options.fetch ?? fetch;
  const requestInitFactory =
    options.requestInitFactory ??
    ((context: FetchRpcRequestContext): RequestInit => ({
      method: "POST",
      headers: {
        "content-type": "application/octet-stream",
        ...(context.requestOptions?.headers ?? {}),
      },
      body: toBodyBuffer(context.payload),
      ...(context.requestOptions?.requestInit ?? {}),
    }));
  let requestId = 1;

  return async function callRpcEndpoint<TArgs extends any[], TResult>(
    method: RpcMethodRef<TArgs, TResult>,
    ...rawArgs: [...TArgs, RpcCallRequestOptions?]
  ): Promise<TResult> {
    const methodName = getRpcMethodName(method);
    if (!methodName) {
      throw new Error("Method ref is missing __nrpcMethodName metadata.");
    }
    const extracted = extractRpcCallRequestOptions(rawArgs);
    const args = extracted.args as TArgs;
    const requestOptions =
      extracted.requestOptions ??
      (method as RpcMethodRefWithRequestOptions)[NRPC_REQUEST_OPTIONS];
    const codec =
      getRpcMethodCodec(method) ?? options.codecResolver?.(methodName);
    const payload = encodeRpcAwaitMessageWithCodec(
      options.awaitEventCode,
      requestId++,
      methodName,
      args,
      codec,
    );
    const response = await fetchImpl(
      options.endpoint,
      requestInitFactory({
        requestId: requestId - 1,
        methodName,
        args,
        codec,
        payload,
        requestOptions,
      }),
    );
    const bytes = new Uint8Array(await response.arrayBuffer());
    const decoded = codec
      ? decodeRpcReturnMessageWithCodec(bytes, codec, options.returnEventCode)
      : decodeRpcReturnMessage(bytes, options.returnEventCode);
    if (!decoded.ok) {
      throw new Error(String(decoded.payload));
    }
    return decoded.payload as TResult;
  };
}

export function createFetchRpcSurface<T>(
  options: FetchRpcCallerOptions & {
    rootPath?: string[];
    codecResolver?: (
      methodName: string,
    ) => RpcMethodCodec<any[], any> | undefined;
  },
): RpcClientSurface<T> {
  const { rootPath = [], codecResolver, ...callerOptions } = options;
  const callRpcEndpoint = createFetchRpcCaller({
    ...callerOptions,
    codecResolver,
  });
  return createEndpointSurface<T>(rootPath, {
    codecResolver,
    caller: ((method: RpcMethodRef<any[], any>, ...args: any[]) =>
      callRpcEndpoint(method, ...args)) as any,
  }) as RpcClientSurface<T>;
}

export function createSyntheticRouteCaller(
  options: SyntheticRouteCallerOptions,
) {
  const fetchImpl = options.fetch ?? fetch;
  const jsonRequestInitFactory =
    options.jsonRequestInitFactory ??
    ((context: SyntheticJsonRequestContext): RequestInit => ({
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(context.requestOptions?.headers ?? {}),
      },
      body: JSON.stringify(context.body),
      ...(context.requestOptions?.requestInit ?? {}),
    }));
  const binaryRequestInitFactory =
    options.binaryRequestInitFactory ??
    ((context: SyntheticBinaryRequestContext): RequestInit => ({
      method: "POST",
      headers: {
        "content-type": "application/octet-stream",
        ...(context.requestOptions?.headers ?? {}),
      },
      body: toBodyBuffer(context.payload),
      ...(context.requestOptions?.requestInit ?? {}),
    }));
  const jsonResponseParser =
    options.jsonResponseParser ??
    (async <TResult>(response: Response): Promise<TResult> => {
      const payload = (await response.json()) as {
        ok?: boolean;
        result?: TResult;
      };
      if (payload && typeof payload === "object" && "ok" in payload) {
        if (!payload.ok) {
          throw new Error("Synthetic JSON route failed.");
        }
        return payload.result as TResult;
      }
      return payload as TResult;
    });
  const routeEntriesByMethod = new Map(
    options.manifest.routes.map((entry) => [entry.methodName, entry] as const),
  );

  function getRoute(
    methodName: string,
    protocol: "json" | "binary",
  ): HttpRouteMatch["entry"] {
    const route = routeEntriesByMethod.get(methodName);
    if (!route || !routeSupportsProtocol(route, protocol)) {
      throw new Error(`Missing synthetic route for ${methodName}`);
    }
    return route;
  }

  return {
    async callJson<TArgs extends any[], TResult>(
      method: RpcMethodRef<TArgs, TResult>,
      ...rawArgs: [...TArgs, RpcCallRequestOptions?]
    ): Promise<TResult> {
      const methodName = getRpcMethodName(method);
      if (!methodName) {
        throw new Error("Method ref is missing __nrpcMethodName metadata.");
      }
      const extracted = extractRpcCallRequestOptions(rawArgs);
      const args = extracted.args as TArgs;
      const requestOptions =
        extracted.requestOptions ??
        (method as RpcMethodRefWithRequestOptions)[NRPC_REQUEST_OPTIONS];
      const route = getRoute(methodName, "json");
      const url = route.httpPath;
      const body = buildJsonRequestBody(route, args);
      const response = await fetchImpl(
        url,
        jsonRequestInitFactory({
          route,
          methodName,
          args,
          url,
          body,
          requestOptions,
        }),
      );
      return jsonResponseParser<TResult>(response, {
        route,
        methodName,
        args,
        url,
        body,
        requestOptions,
      });
    },
    async callBinary<TArgs extends any[], TResult>(
      method: RpcMethodRef<TArgs, TResult>,
      ...rawArgs: [...TArgs, RpcCallRequestOptions?]
    ): Promise<TResult> {
      const methodName = getRpcMethodName(method);
      if (!methodName) {
        throw new Error("Method ref is missing __nrpcMethodName metadata.");
      }
      const extracted = extractRpcCallRequestOptions(rawArgs);
      const args = extracted.args as TArgs;
      const requestOptions =
        extracted.requestOptions ??
        (method as RpcMethodRefWithRequestOptions)[NRPC_REQUEST_OPTIONS];
      const resolvedCodec =
        getRpcMethodCodec(method) ?? options.codecResolver?.(methodName);
      if (!resolvedCodec?.args || !resolvedCodec.result) {
        throw new Error(
          `Missing binary synthetic route or codec for ${methodName}`,
        );
      }
      const route = getRoute(methodName, "binary");
      const payload = resolvedCodec.args.encode(args);
      const url = `${route.httpPath}.nrpc`;
      const response = await fetchImpl(
        url,
        binaryRequestInitFactory({
          route,
          methodName,
          args,
          url,
          body: undefined,
          codec: resolvedCodec,
          payload,
          requestOptions,
        }),
      );
      const bytes = new Uint8Array(await response.arrayBuffer());
      const [decoded] = resolvedCodec.result.decode(bytes, 0);
      return decoded as TResult;
    },
  };
}

export function createSyntheticRouteSurface<T>(
  options: CreateSyntheticRouteSurfaceOptions,
): RpcClientSurfaceWithOptions<T> {
  const {
    rootPath = [],
    codecResolver,
    protocol = "json",
    ...callerOptions
  } = options;
  const caller = createSyntheticRouteCaller(callerOptions);
  return createEndpointSurface<T>(rootPath, {
    codecResolver,
    caller: ((method: RpcMethodRef<any[], any>, ...args: any[]) =>
      protocol === "binary"
        ? caller.callBinary(method, ...args)
        : caller.callJson(method, ...args)) as any,
  }) as RpcClientSurfaceWithOptions<T>;
}

export function attachRpcCallOptions<T>(
  surface: T,
): RpcClientSurfaceWithOptions<T> {
  return surface as RpcClientSurfaceWithOptions<T>;
}

function buildJsonRequestBody(
  route: HttpRouteMatch["entry"],
  args: readonly unknown[],
): unknown {
  if (args.length === 0) {
    return {};
  }

  if (args.length === 1) {
    return args[0];
  }

  const parameterNames = route.parameterNames ?? [];
  return {
    data: [...args],
    ...Object.fromEntries(
      args.map(
        (value, index) =>
          [parameterNames[index] ?? `arg${index}`, value] as const,
      ),
    ),
  };
}

async function readJsonArgs(
  request: Request,
  route: HttpRouteMatch["entry"],
): Promise<readonly unknown[]> {
  const body = await request.json();
  const parameterNames = route.parameterNames ?? [];
  if (Array.isArray(body)) {
    return body;
  }
  if (body && typeof body === "object") {
    const candidate = body as { args?: unknown[]; data?: unknown[] } & Record<
      string,
      unknown
    >;
    if (Array.isArray(candidate.args)) {
      return candidate.args;
    }
    if (Array.isArray(candidate.data)) {
      return candidate.data;
    }
    if (parameterNames.length <= 1) {
      return [body];
    }
    return parameterNames.map(
      (name, index) => candidate[name] ?? candidate[`arg${index}`],
    );
  }
  if (parameterNames.length === 1) {
    return [body];
  }
  throw new Error("Expected JSON body to match the route parameter shape.");
}

async function readBinaryArgs(
  request: Request,
  codec: RpcMethodCodec<any[], any> | undefined,
): Promise<readonly unknown[]> {
  const bytes = await readRequestBytes(request);
  if (codec?.args) {
    const [args] = codec.args.decode(bytes, 0);
    return args;
  }
  const [value] = decodeRpcValue(bytes, 0) as [unknown, number];
  if (!Array.isArray(value)) {
    throw new Error(
      "Expected binary request body to decode to an argument array.",
    );
  }
  return value;
}

function defaultErrorTransformer(error: unknown): unknown {
  return error instanceof Error ? error.message : String(error);
}

function toBodyBuffer(data: Uint8Array): ArrayBuffer {
  return Uint8Array.from(data).buffer;
}

async function readRequestBytes(request: Request): Promise<Uint8Array> {
  return new Uint8Array(await request.arrayBuffer());
}
