# Cross-Domain Patterns — Code Examples

## Decision tree

```
Need data from another domain?          → call their service via index.ts
Same DB query in 2+ domains, no logic?  → shared/repositories/
Same logic in 2+ domains?               → shared/services/
Same type in 2+ domains?               → shared/types/
DB / config / logger / redis / storage? → import directly from infrastructure/
```

## ❌ Forbidden — importing private domain files

```ts
// domains/orders/orders.service.ts
import { usersRepository } from '../users/users.repository'  // ❌ private file
import { UserService }      from '../users/users.service'    // ❌ private file
import { UserResponseDto }  from '../users/users.dto'        // ❌ private file
```

## ✅ Correct — import via index.ts only

```ts
// domains/users/index.ts — public API
export { usersPlugin }  from './users.plugin'
export { UserService }  from './users.service'   // export if other domains need it
export type { UserResponse } from './users.dto'  // export types if needed cross-domain
// users.repository, users.dto (input), users.utils — remain private

// domains/orders/orders.service.ts
import { UserService } from '../users'   // ✅ via index.ts only
```

## Shared repository — query used by 2+ domains

```ts
// shared/repositories/user-lookup.repository.ts
// promoted here because both orders and notifications domains need it
import { eq } from 'drizzle-orm'
import { db } from '../../infrastructure/db'
import { users } from '../../infrastructure/db/schema'

export const userLookupRepository = {
  async findById(id: string) {
    const [user] = await db.select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, id))
    return user
  },
}

// domains/orders/orders.service.ts
import { userLookupRepository } from '../../shared/repositories/user-lookup.repository'
// no service wrapper needed — it's a query utility, not business logic
```

## Shared service — logic used by 2+ domains

```ts
// shared/services/notification.service.ts
// promoted here because both orders and subscriptions trigger notifications
import { db } from '../../infrastructure/db'
import { notifications } from '../../infrastructure/db/schema'

export abstract class NotificationService {
  static async send(userId: string, message: string, type: string) {
    await db.insert(notifications).values({ userId, message, type })
  }
}

// domains/orders/orders.service.ts
import { NotificationService } from '../../shared/services/notification.service'
```

## Shared type — used by 2+ domains

```ts
// shared/types/pagination.types.ts
export interface PaginationMeta {
  total:      number
  page:       number
  perPage:    number
  nextCursor?: string
}

export interface PaginatedResult<T> {
  rows:  T[]
  total: number
}
```

## Infrastructure — always import directly

```ts
// any domain service can import infrastructure directly — it's a horizontal concern
import { db }     from '../../infrastructure/db'
import { redis }  from '../../infrastructure/redis'
import { logger } from '../../infrastructure/logger'
import { env }    from '../../infrastructure/config/env'
// no need to go through index.ts for infrastructure
```

## Service-to-service call across domains

```ts
// domains/orders/orders.service.ts
import { UserService } from '../users'          // via index.ts
import { ProductService } from '../products'   // via index.ts

export abstract class OrderService {
  static async create(data: CreateOrderInput, actorId: string) {
    // call other domain services — never their repositories
    const user    = await UserService.findById(actorId)
    const product = await ProductService.findById(data.productId)

    // own logic + own repository
    return ordersRepository.create({ userId: user.id, productId: product.id, ...data })
  }
}
```
