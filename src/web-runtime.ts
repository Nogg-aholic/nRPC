import {
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
	type RpcCodecResolver,
} from "./http-route-runtime.js";
import type { RpcMethodCodec } from "./types.js";
import { getRpcMethodCodec, getRpcMethodName, type RpcMethodRef } from "./rpc-method-ref.js";

export type RpcClientSurface<T> =
	T extends (...args: infer A) => infer R
		? (...args: A) => Promise<Awaited<R>>
		: T extends object
			? { [K in keyof T]: RpcClientSurface<T[K]> }
			: T;

export type RpcMethodInvoker = (methodName: string, args: readonly unknown[]) => unknown | Promise<unknown>;

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

export type SyntheticJsonResponseFactory = (result: unknown, match: SyntheticRouteInvocation) => Response;

export type SyntheticBinaryResponseFactory = (context: SyntheticBinaryResponseContext) => Response;

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
	requestInitFactory?: (context: FetchRpcRequestContext) => RequestInit;
};

export type FetchRpcRequestContext = {
	requestId: number;
	methodName: string;
	args: readonly unknown[];
	codec: RpcMethodCodec<any[], any> | undefined;
	payload: Uint8Array;
};

export type SyntheticRouteCallerOptions = {
	manifest: HttpRouteManifest;
	fetch?: typeof fetch;
	jsonRequestInitFactory?: (context: SyntheticJsonRequestContext) => RequestInit;
	binaryRequestInitFactory?: (context: SyntheticBinaryRequestContext) => RequestInit;
	jsonResponseParser?: <TResult>(response: Response, context: SyntheticJsonRequestContext) => Promise<TResult>;
};

export type SyntheticJsonRequestContext = {
	route: HttpRouteMatch["entry"];
	methodName: string;
	args: readonly unknown[];
	url: string;
};

export type SyntheticBinaryRequestContext = SyntheticJsonRequestContext & {
	codec: RpcMethodCodec<any[], any>;
	payload: Uint8Array;
};

export function resolveRpcMethod(target: unknown, methodName: string, options: ResolveRpcMethodOptions = {}): (...args: any[]) => unknown {
	const separator = options.separator ?? ".";
	const path = methodName
		.split(separator)
		.filter((segment) => options.allowEmptySegments ? true : segment.length > 0);
	let cursor: unknown = target;
	for (const part of path) {
		cursor = (cursor as Record<string, unknown> | undefined)?.[part];
	}
	if (typeof cursor !== "function") {
		throw new Error(`Unknown RPC method: ${methodName}`);
	}
	return cursor as (...args: any[]) => unknown;
}

export function createRpcMethodInvoker(target: unknown, options?: ResolveRpcMethodOptions): RpcMethodInvoker {
	return async (methodName, args) => {
		const method = resolveRpcMethod(target, methodName, options);
		return method(...args);
	};
}

export function createRpcFetchRequestHandler(options: CreateRpcFetchHandlerOptions): (request: Request) => Promise<Response> {
	const errorStatus = options.errorStatus ?? 500;
	const transformError = options.transformError ?? defaultErrorTransformer;
	const successResponseFactory = options.successResponseFactory ?? ((context) => new Response(toBodyBuffer(context.payload), {
		headers: {
			"content-type": "application/octet-stream",
		},
	}));
	const errorResponseFactory = options.errorResponseFactory ?? ((context) => new Response(toBodyBuffer(context.payload), {
		status: context.status,
		headers: {
			"content-type": "application/octet-stream",
		},
	}));

	return async (request: Request) => {
		const body = await readRequestBytes(request);
		try {
			const genericFrame = decodeRpcAwaitMessageWithCodec(body, undefined, options.awaitEventCode);
			const codec = options.codecResolver(genericFrame.methodName);
			const frame = decodeRpcAwaitMessageWithCodec(body, codec, options.awaitEventCode);
			const args = Array.isArray(frame.args) ? frame.args : [];
			const result = await options.invokeMethod(frame.methodName, args);
			const payload = codec
				? encodeRpcReturnMessageWithCodec(options.returnEventCode, frame.requestId, true, result, codec)
				: encodeRpcReturnMessage(options.returnEventCode, frame.requestId, true, result);
			return successResponseFactory({ request, frame, codec, result, payload });
		} catch (error) {
			const transformedError = transformError(error);
			const payload = encodeRpcReturnMessage(options.returnEventCode, 0, false, transformedError);
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

export function createSyntheticHttpRouteHandler(options: CreateSyntheticHttpRouteHandlerOptions): (request: Request) => Promise<Response | undefined> {
	const matchRoute = createHttpRouteMatcher(options.manifest);
	const jsonResponseFactory = options.jsonResponseFactory ?? ((result, invocation) => {
		if (options.defaultJsonEnvelope === false) {
			return Response.json(result);
		}
		return Response.json({
			ok: true,
			method: invocation.methodName,
			result,
		});
	});
	const binaryResponseFactory = options.binaryResponseFactory ?? ((context) => new Response(toBodyBuffer(context.payload), {
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
		const args = match.protocol === "binary"
			? await readBinaryArgs(request, codec)
			: await readJsonArgs(request);
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
	const requestInitFactory = options.requestInitFactory ?? ((context: FetchRpcRequestContext): RequestInit => ({
		method: "POST",
		headers: {
			"content-type": "application/octet-stream",
		},
		body: toBodyBuffer(context.payload),
	}));
	let requestId = 1;

	return async function callRpcEndpoint<TArgs extends any[], TResult>(
		method: RpcMethodRef<TArgs, TResult>,
		...args: TArgs
	): Promise<TResult> {
		const methodName = getRpcMethodName(method);
		if (!methodName) {
			throw new Error("Method ref is missing __nrpcMethodName metadata.");
		}
		const codec = getRpcMethodCodec(method);
		const payload = encodeRpcAwaitMessageWithCodec(options.awaitEventCode, requestId++, methodName, args, codec);
		const response = await fetchImpl(options.endpoint, requestInitFactory({
			requestId: requestId - 1,
			methodName,
			args,
			codec,
			payload,
		}));
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
		codecResolver?: (methodName: string) => RpcMethodCodec<any[], any> | undefined;
	},
): RpcClientSurface<T> {
	const { rootPath = [], codecResolver, ...callerOptions } = options;
	const callRpcEndpoint = createFetchRpcCaller(callerOptions);
	return createEndpointSurface<T>(rootPath, {
		codecResolver,
		caller: callRpcEndpoint,
	}) as RpcClientSurface<T>;
}

export function createSyntheticRouteCaller(options: SyntheticRouteCallerOptions) {
	const matchRoute = createHttpRouteMatcher(options.manifest);
	const fetchImpl = options.fetch ?? fetch;
	const jsonRequestInitFactory = options.jsonRequestInitFactory ?? ((context: SyntheticJsonRequestContext): RequestInit => ({
		method: "POST",
		headers: {
			"content-type": "application/json",
		},
		body: JSON.stringify({ args: context.args }),
	}));
	const binaryRequestInitFactory = options.binaryRequestInitFactory ?? ((context: SyntheticBinaryRequestContext): RequestInit => ({
		method: "POST",
		headers: {
			"content-type": "application/octet-stream",
		},
		body: toBodyBuffer(context.payload),
	}));
	const jsonResponseParser = options.jsonResponseParser ?? (async <TResult>(response: Response): Promise<TResult> => {
		const payload = await response.json() as { ok?: boolean; result?: TResult };
		if (payload && typeof payload === "object" && "ok" in payload) {
			if (!payload.ok) {
				throw new Error("Synthetic JSON route failed.");
			}
			return payload.result as TResult;
		}
		return payload as TResult;
	});

	function getRoute(methodName: string, protocol: "json" | "binary"): HttpRouteMatch["entry"] {
		const route = matchRoute(`${options.manifest.basePath || ""}/${methodName.replace(/\./g, "/")}${protocol === "binary" ? ".nrpc" : ""}`.replace(/\/+/g, "/"));
		if (!route) {
			throw new Error(`Missing synthetic route for ${methodName}`);
		}
		return route.entry;
	}

	return {
		async callJson<TArgs extends any[], TResult>(method: RpcMethodRef<TArgs, TResult>, ...args: TArgs): Promise<TResult> {
			const methodName = getRpcMethodName(method);
			if (!methodName) {
				throw new Error("Method ref is missing __nrpcMethodName metadata.");
			}
			const route = getRoute(methodName, "json");
			const url = route.httpPath;
			const response = await fetchImpl(url, jsonRequestInitFactory({ route, methodName, args, url }));
			return jsonResponseParser<TResult>(response, { route, methodName, args, url });
		},
		async callBinary<TArgs extends any[], TResult>(method: RpcMethodRef<TArgs, TResult>, ...args: TArgs): Promise<TResult> {
			const methodName = getRpcMethodName(method);
			if (!methodName) {
				throw new Error("Method ref is missing __nrpcMethodName metadata.");
			}
			const codec = getRpcMethodCodec(method);
			if (!codec?.args || !codec.result) {
				throw new Error(`Missing binary synthetic route or codec for ${methodName}`);
			}
			const route = getRoute(methodName, "binary");
			const payload = codec.args.encode(args);
			const url = `${route.httpPath}.nrpc`;
			const response = await fetchImpl(url, binaryRequestInitFactory({ route, methodName, args, url, codec, payload }));
			const bytes = new Uint8Array(await response.arrayBuffer());
			const [decoded] = codec.result.decode(bytes, 0);
			return decoded as TResult;
		},
	};
}

async function readJsonArgs(request: Request): Promise<readonly unknown[]> {
	const body = await request.json();
	if (Array.isArray(body)) {
		return body;
	}
	if (body && typeof body === "object" && Array.isArray((body as { args?: unknown[] }).args)) {
		return (body as { args: unknown[] }).args;
	}
	throw new Error("Expected JSON body to be an array or { args: [] }.");
}

async function readBinaryArgs(request: Request, codec: RpcMethodCodec<any[], any> | undefined): Promise<readonly unknown[]> {
	const bytes = await readRequestBytes(request);
	if (codec?.args) {
		const [args] = codec.args.decode(bytes, 0);
		return args;
	}
	const [value] = decodeRpcValue(bytes, 0) as [unknown, number];
	if (!Array.isArray(value)) {
		throw new Error("Expected binary request body to decode to an argument array.");
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