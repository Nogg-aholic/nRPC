# webRuntime

> **HTTP:** `POST /api/webRuntime` | **Type:** `async function webRuntime(): Promise<{ readonly attachRpcCallOptions: <T>(surface: T) => RpcClientSurface<T>; readonly createFetchRpcCaller: (options: FetchRpcCallerOptions) => <TArgs extends any[], TResult>(method: RpcMethodRef<TArgs, TResult>, ...rawArgs: [...TArgs, (RpcCallRequestOptions | undefined)?]) => Promise<TResult>; readonly createFetchRpcSurface: <T>(options: FetchRpcCallerOptions & { rootPath?: string[] | undefined; codecResolver?: ((methodName: string) => RpcMethodCodec<any[], any> | undefined) | undefined; }) => RpcClientSurface<T>; readonly createRpcFetchRequestHandler: (options: CreateRpcFetchHandlerOptions) => (request: Request) => Promise<Response>; readonly createRpcMethodInvoker: (target: unknown, options?: ResolveRpcMethodOptions | undefined) => RpcMethodInvoker; readonly createSyntheticHttpRouteHandler: (options: CreateSyntheticHttpRouteHandlerOptions) => (request: Request) => Promise<Response | undefined>; readonly createSyntheticRouteCaller: (options: SyntheticRouteCallerOptions) => { callJson<TArgs extends any[], TResult>(method: RpcMethodRef<TArgs, TResult>, ...rawArgs: [...TArgs, (RpcCallRequestOptions | undefined)?]): Promise<TResult>; callBinary<TArgs extends any[], TResult>(method: RpcMethodRef<TArgs, TResult>, ...rawArgs: [...TArgs, (RpcCallRequestOptions | undefined)?]): Promise<TResult>; }; readonly createSyntheticRouteSurface: <T>(options: CreateSyntheticRouteSurfaceOptions) => RpcClientSurface<T>; readonly resolveRpcMethod: (target: unknown, methodName: string, options?: ResolveRpcMethodOptions) => (...args: any[]) => unknown; }>` | **Location:** [`../../src/index.ts:137`](../../src/index.ts:137)

## Signature

```typescript
async function webRuntime(): Promise<{ readonly attachRpcCallOptions: <T>(surface: T) => RpcClientSurface<T>; readonly createFetchRpcCaller: (options: FetchRpcCallerOptions) => <TArgs extends any[], TResult>(method: RpcMethodRef<TArgs, TResult>, ...rawArgs: [...TArgs, (RpcCallRequestOptions | undefined)?]) => Promise<TResult>; readonly createFetchRpcSurface: <T>(options: FetchRpcCallerOptions & { rootPath?: string[] | undefined; codecResolver?: ((methodName: string) => RpcMethodCodec<any[], any> | undefined) | undefined; }) => RpcClientSurface<T>; readonly createRpcFetchRequestHandler: (options: CreateRpcFetchHandlerOptions) => (request: Request) => Promise<Response>; readonly createRpcMethodInvoker: (target: unknown, options?: ResolveRpcMethodOptions | undefined) => RpcMethodInvoker; readonly createSyntheticHttpRouteHandler: (options: CreateSyntheticHttpRouteHandlerOptions) => (request: Request) => Promise<Response | undefined>; readonly createSyntheticRouteCaller: (options: SyntheticRouteCallerOptions) => { callJson<TArgs extends any[], TResult>(method: RpcMethodRef<TArgs, TResult>, ...rawArgs: [...TArgs, (RpcCallRequestOptions | undefined)?]): Promise<TResult>; callBinary<TArgs extends any[], TResult>(method: RpcMethodRef<TArgs, TResult>, ...rawArgs: [...TArgs, (RpcCallRequestOptions | undefined)?]): Promise<TResult>; }; readonly createSyntheticRouteSurface: <T>(options: CreateSyntheticRouteSurfaceOptions) => RpcClientSurface<T>; readonly resolveRpcMethod: (target: unknown, methodName: string, options?: ResolveRpcMethodOptions) => (...args: any[]) => unknown; }>
```

## Returns

`{ readonly attachRpcCallOptions: <T>(surface: T) => RpcClientSurface<T>; readonly createFetchRpcCaller: (options: FetchRpcCallerOptions) => <TArgs extends any[], TResult>(method: RpcMethodRef<TArgs, TResult>, ...rawArgs: [...TArgs, (RpcCallRequestOptions | undefined)?]) => Promise<TResult>; readonly createFetchRpcSurface: <T>(options: FetchRpcCallerOptions & { rootPath?: string[] | undefined; codecResolver?: ((methodName: string) => RpcMethodCodec<any[], any> | undefined) | undefined; }) => RpcClientSurface<T>; readonly createRpcFetchRequestHandler: (options: CreateRpcFetchHandlerOptions) => (request: Request) => Promise<Response>; readonly createRpcMethodInvoker: (target: unknown, options?: ResolveRpcMethodOptions | undefined) => RpcMethodInvoker; readonly createSyntheticHttpRouteHandler: (options: CreateSyntheticHttpRouteHandlerOptions) => (request: Request) => Promise<Response | undefined>; readonly createSyntheticRouteCaller: (options: SyntheticRouteCallerOptions) => { callJson<TArgs extends any[], TResult>(method: RpcMethodRef<TArgs, TResult>, ...rawArgs: [...TArgs, (RpcCallRequestOptions | undefined)?]): Promise<TResult>; callBinary<TArgs extends any[], TResult>(method: RpcMethodRef<TArgs, TResult>, ...rawArgs: [...TArgs, (RpcCallRequestOptions | undefined)?]): Promise<TResult>; }; readonly createSyntheticRouteSurface: <T>(options: CreateSyntheticRouteSurfaceOptions) => RpcClientSurface<T>; readonly resolveRpcMethod: (target: unknown, methodName: string, options?: ResolveRpcMethodOptions) => (...args: any[]) => unknown; }`

Return value

## Implementation

```typescript
{
		attachRpcCallOptions,
		createFetchRpcCaller,
		createFetchRpcSurface,
		createRpcFetchRequestHandler,
		createRpcMethodInvoker,
		createSyntheticHttpRouteHandler,
		createSyntheticRouteCaller,
		createSyntheticRouteSurface,
		resolveRpcMethod,
	}
```

## Dependencies

### Internal

#### `{ readonly attachRpcCallOptions: <T>(surface: T) => RpcClientSurface<T>; readonly createFetchRpcCaller: (options: FetchRpcCallerOptions) => <TArgs extends any[], TResult>(method: RpcMethodRef<TArgs, TResult>, ...rawArgs: [...TArgs, (RpcCallRequestOptions | undefined)?]) => Promise<TResult>; readonly createFetchRpcSurface: <T>(options: FetchRpcCallerOptions & { rootPath?: string[] | undefined; codecResolver?: ((methodName: string) => RpcMethodCodec<any[], any> | undefined) | undefined; }) => RpcClientSurface<T>; readonly createRpcFetchRequestHandler: (options: CreateRpcFetchHandlerOptions) => (request: Request) => Promise<Response>; readonly createRpcMethodInvoker: (target: unknown, options?: ResolveRpcMethodOptions | undefined) => RpcMethodInvoker; readonly createSyntheticHttpRouteHandler: (options: CreateSyntheticHttpRouteHandlerOptions) => (request: Request) => Promise<Response | undefined>; readonly createSyntheticRouteCaller: (options: SyntheticRouteCallerOptions) => { callJson<TArgs extends any[], TResult>(method: RpcMethodRef<TArgs, TResult>, ...rawArgs: [...TArgs, (RpcCallRequestOptions | undefined)?]): Promise<TResult>; callBinary<TArgs extends any[], TResult>(method: RpcMethodRef<TArgs, TResult>, ...rawArgs: [...TArgs, (RpcCallRequestOptions | undefined)?]): Promise<TResult>; }; readonly createSyntheticRouteSurface: <T>(options: CreateSyntheticRouteSurfaceOptions) => RpcClientSurface<T>; readonly resolveRpcMethod: (target: unknown, methodName: string, options?: ResolveRpcMethodOptions) => (...args: any[]) => unknown; }` (type)

**Description:** Return type
