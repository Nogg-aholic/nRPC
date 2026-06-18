# types.RpcArgTag

> **HTTP:** `POST /api/types/RpcArgTag` | **Type:** `async function types.RpcArgTag(): Promise<typeof RpcArgTag>` | **Location:** [`../../src/index.ts:78`](../../src/index.ts:78)

## Signature

```typescript
async function types.RpcArgTag(): Promise<typeof RpcArgTag>
```

## Returns

`typeof RpcArgTag`

Return value

## Implementation

```typescript
export enum RpcArgTag {
  Null = 0x00,
  Undefined = 0x09,
  False = 0x01,
  True = 0x02,
  Float64 = 0x03,
  String = 0x04,
  TypedArray = 0x05,
  Array = 0x06,
  Object = 0x07,
  BigInt64 = 0x08,
}
```

## Dependencies

### Internal

#### `typeof RpcArgTag` (type)

**Description:** Return type
