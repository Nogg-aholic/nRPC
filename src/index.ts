import { RpcArgTag, TypedArrayType } from "./types.js";
import { align8, createTypedArray, getTypedArrayType, isPlainObject, isTypedArray, toUint8Array } from "./encoding.js";
import { decodeRpcValue, encodeRpcValue } from "./value-codec.js";
import {
	decodeRpcAwaitMessage,
	decodeRpcAwaitMessageWithCodec,
	decodeRpcAwaitMethodName,
	decodeRpcCallMessage,
	decodeRpcCallMessageWithCodec,
	decodeRpcReturnMessage,
	decodeRpcReturnMessageWithCodec,
	encodeRpcAwaitMessage,
	encodeRpcAwaitMessageWithCodec,
	encodeRpcCallMessage,
	encodeRpcCallMessageWithCodec,
	encodeRpcReturnMessage,
	encodeRpcReturnMessageWithCodec,
} from "./rpc-frame.js";
import {
	NRPC_METHOD_CALLER,
	NRPC_METHOD_CODEC,
	NRPC_METHOD_REF,
	attachRpcCaller,
	attachRpcMethodMetadata,
	createEndpointSurface,
	createNamedRpcMethodRef,
	createRpcCodecRegistry,
	createRpcCodecResolverFromSurface,
	createRpcProxy,
	defineEndpointSurface,
	defineRpcMethodRef,
	getRpcMethodCodec,
	getRpcMethodName,
	isRpcMethodRef,
	serializeRpcMethodRefs,
	withRpcMethodCodec,
} from "./rpc-method-ref.js";
import {
	GeneratedCodecReader,
	GeneratedCodecWriter,
	createGeneratedPayloadCodec,
	createGeneratedRpcMethodCodec,
} from "./generated-codec-runtime.js";
import { createHttpRouteMatcher, routeSupportsProtocol } from "./http-route-runtime.js";
import {
	attachRpcCallOptions,
	createFetchRpcCaller,
	createFetchRpcSurface,
	createRpcFetchRequestHandler,
	createRpcMethodInvoker,
	createSyntheticHttpRouteHandler,
	createSyntheticRouteCaller,
	createSyntheticRouteSurface,
	resolveRpcMethod,
} from "./web-runtime.js";
import {
	asUpstreamProxyInjectionDefinition,
	buildSyntheticRpcDeclaration,
	buildSyntheticRpcRuntime,
	defineHostRpcSurface,
	defineSyntheticRpcBinding,
	defineSyntheticRpcSurface,
} from "./synthetic-rpc-surface.js";
import { RPC_AWAIT_EVENT, RPC_RETURN_EVENT, isWebsocketEnabled } from "./service-constants.js";
import { RpcServiceError, defaultTransformError, isRpcServiceError } from "./service-errors.js";
import { loadServiceConfig } from "./service-env.js";
import { createRpcBinaryErrorResponse, jsonError, notFoundJson } from "./service-responses.js";
import { mountRpcNamespace } from "./service-composition.js";
import { createServiceFetchHandler } from "./service-fetch-handler.js";
import { handleRpcWebSocketMessage } from "./service-ws-dispatcher.js";
import { startBunRpcServer } from "./service-bun-server.js";
import { createMcpHttpHandler } from "./mcp-http-handler.js";
import { createNodeHttpServer, createNodeRequestHandler, createNodeServerHandlers, withOpenTelemetryNodeServer } from "./node-server.js";
import { createBunRequestHandler, createBunServer, createBunServerHandlers } from "./bun-server.js";

export const nrpc = {
	types: {
		RpcArgTag,
		TypedArrayType,
	},
	encoding: {
		align8,
		createTypedArray,
		getTypedArrayType,
		isPlainObject,
		isTypedArray,
		toUint8Array,
	},
	valueCodec: {
		decodeRpcValue,
		encodeRpcValue,
	},
	rpcFrame: {
		decodeRpcAwaitMessage,
		decodeRpcAwaitMessageWithCodec,
		decodeRpcAwaitMethodName,
		decodeRpcCallMessage,
		decodeRpcCallMessageWithCodec,
		decodeRpcReturnMessage,
		decodeRpcReturnMessageWithCodec,
		encodeRpcAwaitMessage,
		encodeRpcAwaitMessageWithCodec,
		encodeRpcCallMessage,
		encodeRpcCallMessageWithCodec,
		encodeRpcReturnMessage,
		encodeRpcReturnMessageWithCodec,
	},
	rpcMethodRef: {
		NRPC_METHOD_CALLER,
		NRPC_METHOD_CODEC,
		NRPC_METHOD_REF,
		attachRpcCaller,
		attachRpcMethodMetadata,
		createEndpointSurface,
		createNamedRpcMethodRef,
		createRpcCodecRegistry,
		createRpcCodecResolverFromSurface,
		createRpcProxy,
		defineEndpointSurface,
		defineRpcMethodRef,
		getRpcMethodCodec,
		getRpcMethodName,
		isRpcMethodRef,
		serializeRpcMethodRefs,
		withRpcMethodCodec,
	},
	generatedCodecRuntime: {
		GeneratedCodecReader,
		GeneratedCodecWriter,
		createGeneratedPayloadCodec,
		createGeneratedRpcMethodCodec,
	},
	httpRouteRuntime: {
		createHttpRouteMatcher,
		routeSupportsProtocol,
	},
	webRuntime: {
		attachRpcCallOptions,
		createFetchRpcCaller,
		createFetchRpcSurface,
		createRpcFetchRequestHandler,
		createRpcMethodInvoker,
		createSyntheticHttpRouteHandler,
		createSyntheticRouteCaller,
		createSyntheticRouteSurface,
		resolveRpcMethod,
	},
	syntheticRpcSurface: {
		asUpstreamProxyInjectionDefinition,
		buildSyntheticRpcDeclaration,
		buildSyntheticRpcRuntime,
		defineHostRpcSurface,
		defineSyntheticRpcBinding,
		defineSyntheticRpcSurface,
	},
	upstreamProxyInjection: {
		asUpstreamProxyInjectionDefinition,
		buildSyntheticRpcDeclaration,
		buildSyntheticRpcRuntime,
		defineHostRpcSurface,
		defineSyntheticRpcBinding,
		defineSyntheticRpcSurface,
	},
	serviceConstants: {
		RPC_AWAIT_EVENT,
		RPC_RETURN_EVENT,
		isWebsocketEnabled,
	},
	serviceErrors: {
		RpcServiceError,
		defaultTransformError,
		isRpcServiceError,
	},
	serviceEnv: {
		loadServiceConfig,
	},
	serviceResponses: {
		createRpcBinaryErrorResponse,
		jsonError,
		notFoundJson,
	},
	serviceComposition: {
		mountRpcNamespace,
	},
	serviceFetchHandler: {
		createServiceFetchHandler,
	},
	serviceWsDispatcher: {
		handleRpcWebSocketMessage,
	},
	serviceBunServer: {
		startBunRpcServer,
	},
	mcpHttpHandler: {
		createMcpHttpHandler,
	},
	nodeServer: {
		createNodeHttpServer,
		createNodeRequestHandler,
		createNodeServerHandlers,
		withOpenTelemetryNodeServer,
	},
	bunServer: {
		createBunRequestHandler,
		createBunServer,
		createBunServerHandlers,
	},
} as const;

export type NrpcNamespace = typeof nrpc;

export * from "./types.js";
export * from "./encoding.js";
export * from "./value-codec.js";
export * from "./rpc-frame.js";
export * from "./rpc-method-ref.js";
export * from "./generated-codec-runtime.js";
export * from "./http-route-runtime.js";
export * from "./web-runtime.js";
export * from "./synthetic-rpc-surface.js";
export * from "./upstream-proxy-injection.js";
export * from "./service-constants.js";
export * from "./service-errors.js";
export * from "./service-env.js";
export * from "./service-responses.js";
export * from "./service-composition.js";
export * from "./service-fetch-handler.js";
export * from "./service-ws-dispatcher.js";
export * from "./service-bun-server.js";
export * from "./mcp-http-handler.js";
export * from "./node-server.js";
export * from "./bun-server.js";
