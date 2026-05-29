# DTO Patterns — Code Examples

## Input DTOs

```ts
// domains/users/users.dto.ts
import { z } from 'zod'

export const CreateUserDto = z.object({
  name:  z.string().min(1).max(100),
  email: z.string().email(),
  role:  z.enum(['admin', 'user']).default('user'),
})

// partial() reuses CreateUserDto — never duplicate fields
export const UpdateUserDto = CreateUserDto.partial()

export const ListUsersQueryDto = z.object({
  page:     z.coerce.number().int().positive().default(1),
  perPage:  z.coerce.number().int().positive().max(100).default(20),
  role:     z.enum(['admin', 'user']).optional(),
  isActive: z.coerce.boolean().optional(),
  search:   z.string().optional(),
})

// always infer from schema — never write types manually
export type CreateUserInput  = z.infer<typeof CreateUserDto>
export type UpdateUserInput  = z.infer<typeof UpdateUserDto>
export type ListUsersInput   = z.infer<typeof ListUsersQueryDto>
```

## Response DTO — strip sensitive fields

```ts
// domains/users/users.dto.ts (continued)

export const UserResponseDto = z.object({
  id:        z.string(),
  name:      z.string(),
  email:     z.string(),
  role:      z.enum(['admin', 'user']),
  isActive:  z.boolean(),
  createdAt: z.string().datetime(),
})
// passwordHash, internalFlags, etc. are never in this schema — they're stripped

export type UserResponse = z.infer<typeof UserResponseDto>
```

## Simple transform — rename/strip inline

```ts
// when shape only needs minor renaming, keep it in .transform()
export const UserResponseDto = z.object({
  id:        z.string(),
  name:      z.string(),
  email:     z.string(),
  role:      z.enum(['admin', 'user']),
  isActive:  z.boolean(),
  createdAt: z.date(),
}).transform(u => ({
  ...u,
  createdAt: u.createdAt.toISOString(),  // Date → ISO string for JSON
}))
```

## Complex mapper — extract to utils

```ts
// domains/users/users.utils.ts
// use when: multiple output fields, branching logic, reused across DTOs
import type { User } from '../infrastructure/db/schema'
import type { UserResponse } from './users.dto'

export function toUserResponse(user: User): UserResponse {
  return {
    id:        user.id,
    name:      user.name,
    email:     user.email,
    role:      user.role,
    isActive:  user.isActive,
    createdAt: user.createdAt.toISOString(),
  }
}
```

## Array responses — reuse entity DTO

```ts
// domains/users/users.service.ts
import { UserResponseDto } from './users.dto'

// reuse entity DTO — never write a separate ListUsersResponseDto
const users = await usersRepository.findMany(filters)
return {
  data: users.rows.map(u => UserResponseDto.parse(u)),
  meta: { total: users.total, page: filters.page, perPage: filters.perPage },
}
```

## Combined response — service assembles

```ts
// domains/orders/orders.dto.ts
import { z } from 'zod'
import { UserResponseDto } from '../users/users.dto'
import { ProductResponseDto } from '../products/products.dto'

// each domain owns its DTO; this schema just composes them
export const OrderDetailResponseDto = z.object({
  id:        z.string(),
  status:    z.enum(['pending', 'paid', 'shipped', 'cancelled']),
  total:     z.number(),
  createdAt: z.string().datetime(),
  user:      UserResponseDto,
  items:     z.array(z.object({
    product:  ProductResponseDto,
    quantity: z.number(),
    price:    z.number(),
  })),
})

export type OrderDetailResponse = z.infer<typeof OrderDetailResponseDto>
```

```ts
// domains/orders/orders.service.ts
// service assembles the combined shape; each entity parsed through its own DTO
async function getOrderDetail(orderId: string): Promise<OrderDetailResponse> {
  const order = await ordersRepository.findDetailById(orderId)
  if (!order) throw new NotFoundError('Order')

  return OrderDetailResponseDto.parse({
    ...order,
    user:  UserResponseDto.parse(order.user),
    items: order.items.map(i => ({
      ...i,
      product: ProductResponseDto.parse(i.product),
    })),
  })
}
```

## Aggregations — service computes alongside parsed entity

```ts
// domains/orders/orders.service.ts
async function getOrderSummary(userId: string) {
  const [orders, stats] = await Promise.all([
    ordersRepository.findByUser(userId),
    ordersRepository.getStats(userId),
  ])

  return {
    orders: orders.map(o => OrderResponseDto.parse(o)),
    // aggregated fields added alongside parsed entities
    summary: {
      total:   stats.total,
      pending: stats.pending,
      paid:    stats.paid,
    },
  }
}
```

## Paginated response factory

```ts
// shared/types/response.types.ts
import { z } from 'zod'

export function paginatedResponse<T extends z.ZodTypeAny>(schema: T) {
  return z.object({
    data: z.array(schema),
    meta: z.object({
      total:      z.number(),
      page:       z.number(),
      perPage:    z.number(),
      nextCursor: z.string().optional(),
    }),
  })
}

// usage:
export const PaginatedUsersDto = paginatedResponse(UserResponseDto)
export type PaginatedUsers = z.infer<typeof PaginatedUsersDto>
```

## Discriminated union — typed API result

```ts
// shared/types/response.types.ts
export type ApiResult<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: string; code: string }

// service returns domain type directly — wrapping happens at plugin layer if needed
```
