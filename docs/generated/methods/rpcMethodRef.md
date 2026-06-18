# rpcMethodRef

> **HTTP:** `POST /api/rpcMethodRef` | **Type:** `async function rpcMethodRef(): Promise<{ readonly NRPC_METHOD_CALLER: typeof NRPC_METHOD_CALLER; readonly NRPC_METHOD_CODEC: typeof NRPC_METHOD_CODEC; readonly NRPC_METHOD_REF: typeof NRPC_METHOD_REF; readonly attachRpcCaller: <T>(surface: T, caller: RpcMethodCaller) => T; readonly attachRpcMethodMetadata: <T extends object>(target: T, methodName: string) => T; readonly createEndpointSurface: <T>(pathParts?: string[], options?: CreateEndpointSurfaceOptions) => Rpcify<T>; readonly createNamedRpcMethodRef: <TArgs extends any[] = any[], TResult = any>(methodName: string) => RpcMethodRef<TArgs, TResult>; readonly createRpcCodecRegistry: (entries: Iterable<readonly [string, RpcMethodCodec<any[], any>]>) => RpcMethodCodecResolver; readonly createRpcCodecResolverFromSurface: (surface: unknown) => RpcMethodCodecResolver; readonly createRpcProxy: <T>(pathParts?: string[]) => Rpcify<T>; readonly defineEndpointSurface: <T extends object>(surface: T) => T; readonly defineRpcMethodRef: <TCallable extends (...args: any[]) => Promise<any>>(callable: TCallable) => RpcMethodRefFromCallable<TCallable>; readonly getRpcMethodCodec: <Args extends any[] = any[], Result = any>(value: unknown) => RpcMethodCodec<Args, Result> | undefined; readonly getRpcMethodName: (value: unknown) => string | undefined; readonly isRpcMethodRef: (value: unknown) => value is RpcMethodRef<any[], any>; readonly serializeRpcMethodRefs: (value: unknown) => unknown; readonly withRpcMethodCodec: <TArgs extends any[] = any[], TResult = any>(methodRef: RpcMethodRef<TArgs, TResult>, codec: RpcMethodCodec<TArgs, TResult>) => RpcMethodRef<TArgs, TResult>; }>` | **Location:** [`../../src/index.ts:108`](../../src/index.ts:108)

## Signature

```typescript
async function rpcMethodRef(): Promise<{ readonly NRPC_METHOD_CALLER: typeof NRPC_METHOD_CALLER; readonly NRPC_METHOD_CODEC: typeof NRPC_METHOD_CODEC; readonly NRPC_METHOD_REF: typeof NRPC_METHOD_REF; readonly attachRpcCaller: <T>(surface: T, caller: RpcMethodCaller) => T; readonly attachRpcMethodMetadata: <T extends object>(target: T, methodName: string) => T; readonly createEndpointSurface: <T>(pathParts?: string[], options?: CreateEndpointSurfaceOptions) => Rpcify<T>; readonly createNamedRpcMethodRef: <TArgs extends any[] = any[], TResult = any>(methodName: string) => RpcMethodRef<TArgs, TResult>; readonly createRpcCodecRegistry: (entries: Iterable<readonly [string, RpcMethodCodec<any[], any>]>) => RpcMethodCodecResolver; readonly createRpcCodecResolverFromSurface: (surface: unknown) => RpcMethodCodecResolver; readonly createRpcProxy: <T>(pathParts?: string[]) => Rpcify<T>; readonly defineEndpointSurface: <T extends object>(surface: T) => T; readonly defineRpcMethodRef: <TCallable extends (...args: any[]) => Promise<any>>(callable: TCallable) => RpcMethodRefFromCallable<TCallable>; readonly getRpcMethodCodec: <Args extends any[] = any[], Result = any>(value: unknown) => RpcMethodCodec<Args, Result> | undefined; readonly getRpcMethodName: (value: unknown) => string | undefined; readonly isRpcMethodRef: (value: unknown) => value is RpcMethodRef<any[], any>; readonly serializeRpcMethodRefs: (value: unknown) => unknown; readonly withRpcMethodCodec: <TArgs extends any[] = any[], TResult = any>(methodRef: RpcMethodRef<TArgs, TResult>, codec: RpcMethodCodec<TArgs, TResult>) => RpcMethodRef<TArgs, TResult>; }>
```

## Returns

`{ readonly NRPC_METHOD_CALLER: typeof NRPC_METHOD_CALLER; readonly NRPC_METHOD_CODEC: typeof NRPC_METHOD_CODEC; readonly NRPC_METHOD_REF: typeof NRPC_METHOD_REF; readonly attachRpcCaller: <T>(surface: T, caller: RpcMethodCaller) => T; readonly attachRpcMethodMetadata: <T extends object>(target: T, methodName: string) => T; readonly createEndpointSurface: <T>(pathParts?: string[], options?: CreateEndpointSurfaceOptions) => Rpcify<T>; readonly createNamedRpcMethodRef: <TArgs extends any[] = any[], TResult = any>(methodName: string) => RpcMethodRef<TArgs, TResult>; readonly createRpcCodecRegistry: (entries: Iterable<readonly [string, RpcMethodCodec<any[], any>]>) => RpcMethodCodecResolver; readonly createRpcCodecResolverFromSurface: (surface: unknown) => RpcMethodCodecResolver; readonly createRpcProxy: <T>(pathParts?: string[]) => Rpcify<T>; readonly defineEndpointSurface: <T extends object>(surface: T) => T; readonly defineRpcMethodRef: <TCallable extends (...args: any[]) => Promise<any>>(callable: TCallable) => RpcMethodRefFromCallable<TCallable>; readonly getRpcMethodCodec: <Args extends any[] = any[], Result = any>(value: unknown) => RpcMethodCodec<Args, Result> | undefined; readonly getRpcMethodName: (value: unknown) => string | undefined; readonly isRpcMethodRef: (value: unknown) => value is RpcMethodRef<any[], any>; readonly serializeRpcMethodRefs: (value: unknown) => unknown; readonly withRpcMethodCodec: <TArgs extends any[] = any[], TResult = any>(methodRef: RpcMethodRef<TArgs, TResult>, codec: RpcMethodCodec<TArgs, TResult>) => RpcMethodRef<TArgs, TResult>; }`

Return value

## Implementation

```typescript
{
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
	}
```

## Dependencies

### Internal

#### `{ readonly NRPC_METHOD_CALLER: typeof NRPC_METHOD_CALLER; readonly NRPC_METHOD_CODEC: typeof NRPC_METHOD_CODEC; readonly NRPC_METHOD_REF: typeof NRPC_METHOD_REF; readonly attachRpcCaller: <T>(surface: T, caller: RpcMethodCaller) => T; readonly attachRpcMethodMetadata: <T extends object>(target: T, methodName: string) => T; readonly createEndpointSurface: <T>(pathParts?: string[], options?: CreateEndpointSurfaceOptions) => Rpcify<T>; readonly createNamedRpcMethodRef: <TArgs extends any[] = any[], TResult = any>(methodName: string) => RpcMethodRef<TArgs, TResult>; readonly createRpcCodecRegistry: (entries: Iterable<readonly [string, RpcMethodCodec<any[], any>]>) => RpcMethodCodecResolver; readonly createRpcCodecResolverFromSurface: (surface: unknown) => RpcMethodCodecResolver; readonly createRpcProxy: <T>(pathParts?: string[]) => Rpcify<T>; readonly defineEndpointSurface: <T extends object>(surface: T) => T; readonly defineRpcMethodRef: <TCallable extends (...args: any[]) => Promise<any>>(callable: TCallable) => RpcMethodRefFromCallable<TCallable>; readonly getRpcMethodCodec: <Args extends any[] = any[], Result = any>(value: unknown) => RpcMethodCodec<Args, Result> | undefined; readonly getRpcMethodName: (value: unknown) => string | undefined; readonly isRpcMethodRef: (value: unknown) => value is RpcMethodRef<any[], any>; readonly serializeRpcMethodRefs: (value: unknown) => unknown; readonly withRpcMethodCodec: <TArgs extends any[] = any[], TResult = any>(methodRef: RpcMethodRef<TArgs, TResult>, codec: RpcMethodCodec<TArgs, TResult>) => RpcMethodRef<TArgs, TResult>; }` (type)

**Description:** Return type
