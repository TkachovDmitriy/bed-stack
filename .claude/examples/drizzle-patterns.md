# Drizzle Patterns — Code Examples

## Schema Definition

```ts
// infrastructure/db/schema/users.schema.ts
import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id:        uuid('id').primaryKey().defaultRandom(),
  name:      text('name').notNull(),
  email:     text('email').notNull().unique(),
  role:      text('role', { enum: ['admin', 'user'] }).notNull().default('user'),
  isActive:  boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// always infer types from schema — never write manually
export type User    = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

```ts
// infrastructure/db/schema/index.ts
export * from './users.schema'
export * from './posts.schema'
```

## Repository Pattern

```ts
// domains/users/users.repository.ts
import { eq, and, ilike, SQL } from 'drizzle-orm'
import { db } from '../../infrastructure/db'
import { users } from '../../infrastructure/db/schema'
import type { User, NewUser } from '../../infrastructure/db/schema'
import type { ListUsersInput } from './users.dto'

export const usersRepository = {
  async findById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id))
    return user
  },

  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email))
    return user
  },

  async findMany(filters: ListUsersInput): Promise<{ rows: User[]; total: number }> {
    const query = buildUsersQuery(filters)
    const rows = await query
    const [{ count }] = await db.select({ count: count() }).from(users)
    return { rows, total: Number(count) }
  },

  async create(data: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning()
    return user
  },

  async update(id: string, data: Partial<NewUser>): Promise<User> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning()
    return user
  },

  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id))
  },
}
```

## Conditional Query Builder — 3+ Optional Filters

```ts
// inside users.repository.ts
function buildUsersQuery(filters: ListUsersInput) {
  const conditions: SQL[] = []

  if (filters.role)     conditions.push(eq(users.role, filters.role))
  if (filters.isActive !== undefined) conditions.push(eq(users.isActive, filters.isActive))
  if (filters.search)   conditions.push(ilike(users.name, `%${filters.search}%`))

  return db
    .select()
    .from(users)
    .where(conditions.length ? and(...conditions) : undefined)
    .limit(filters.perPage)
    .offset((filters.page - 1) * filters.perPage)
}
```

## Transactions — Atomic Multi-Step Mutations

```ts
// domains/orders/orders.service.ts
import { db } from '../../infrastructure/db'
import { orders, orderItems, inventory } from '../../infrastructure/db/schema'

async function createOrder(data: CreateOrderInput, userId: string) {
  return db.transaction(async (tx) => {
    // 1. create order
    const [order] = await tx.insert(orders)
      .values({ userId, status: 'pending', total: data.total })
      .returning()

    // 2. create items
    await tx.insert(orderItems)
      .values(data.items.map(item => ({ orderId: order.id, ...item })))

    // 3. decrement inventory
    for (const item of data.items) {
      await tx.update(inventory)
        .set({ quantity: sql`quantity - ${item.quantity}` })
        .where(eq(inventory.productId, item.productId))
    }

    return order
  })
  // if any step throws — entire transaction rolls back automatically
}
```

## DB View — Latest/Active Record

```ts
// infrastructure/db/schema/subscriptions.schema.ts
import { pgView } from 'drizzle-orm/pg-core'

// instead of repeating ORDER BY created_at DESC LIMIT 1 everywhere:
export const activeSubscriptions = pgView('active_subscriptions').as(
  db.selectDistinctOn([subscriptions.userId])
    .from(subscriptions)
    .orderBy(subscriptions.userId, desc(subscriptions.createdAt))
)

// usage in any repository:
const sub = await db.select().from(activeSubscriptions).where(eq(activeSubscriptions.userId, id))
```

## DB Connection

```ts
// infrastructure/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '../config/env'
import * as schema from './schema'

const client = postgres(env.DATABASE_URL)
export const db = drizzle(client, { schema })
```

## Multiple Configs — Primary + Replica

```ts
// infrastructure/db/configs/primary.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '../../config/env'

const client = postgres(env.DATABASE_URL, { max: 10 })
export const primaryDb = drizzle(client)

// infrastructure/db/configs/replica.ts
const replicaClient = postgres(env.DATABASE_REPLICA_URL, { max: 20, readonly: true })
export const replicaDb = drizzle(replicaClient)

// infrastructure/db/index.ts — export both
export { primaryDb as db, replicaDb }
// repositories use db for writes, replicaDb for read-heavy queries
```
