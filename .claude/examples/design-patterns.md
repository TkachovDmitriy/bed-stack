# Design Patterns — Code Examples

## Strategy — inject behavior, don't branch internally

```ts
// ❌ avoid — branching inside on role/type
export abstract class ReportService {
  static async generate(userId: string, role: string) {
    if (role === 'admin') return generateAdminReport(userId)
    if (role === 'user')  return generateUserReport(userId)
    throw new Error('Unknown role')
  }
}

// ✅ prefer — inject behavior as parameter
export abstract class ReportService {
  static async generate(
    userId: string,
    strategy: (userId: string) => Promise<Report>
  ) {
    return strategy(userId)
  }
}

// domains/reports/reports.plugin.ts
.get('/report', ({ user }) =>
  ReportService.generate(
    user.id,
    user.role === 'admin' ? generateAdminReport : generateUserReport
  )
)
```

## Factory Map — 3+ component/handler variants

```ts
// domains/notifications/notifications.constants.ts
import { satisfies } from 'typescript'   // built-in operator
import type { NotificationHandler } from './notifications.types'

// use satisfies to validate shape without widening
export const NOTIFICATION_HANDLERS = {
  email:   sendEmailNotification,
  sms:     sendSmsNotification,
  push:    sendPushNotification,
  webhook: sendWebhookNotification,
} satisfies Record<NotificationType, NotificationHandler>

// domains/notifications/notifications.service.ts
// lookup instead of switch/if chain — adding a new type = adding one map entry
export abstract class NotificationService {
  static async send(type: NotificationType, payload: NotificationPayload) {
    const handler = NOTIFICATION_HANDLERS[type]
    return handler(payload)
  }
}
```

## Status Transition Map — explicit valid transitions

```ts
// domains/orders/orders.constants.ts
import type { OrderStatus } from './orders.types'

export const ORDER_TRANSITIONS = {
  pending:   ['paid', 'cancelled'],
  paid:      ['shipped', 'refunded'],
  shipped:   ['delivered'],
  delivered: [],
  cancelled: [],
  refunded:  [],
} satisfies Record<OrderStatus, OrderStatus[]>

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from].includes(to)
}
```

```ts
// domains/orders/orders.service.ts
export abstract class OrderService {
  static async updateStatus(orderId: string, newStatus: OrderStatus) {
    const order = await ordersRepository.findById(orderId)
    if (!order) throw new NotFoundError('Order')

    // validate transition before any DB call — UX guard
    if (!canTransition(order.status, newStatus))
      throw new ConflictError(`Cannot transition from ${order.status} to ${newStatus}`)

    // DB transaction is the final authority — wrap in tx for atomicity
    return db.transaction(async (tx) => {
      const [updated] = await tx.update(orders)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(orders.id, orderId))
        .returning()

      await tx.insert(orderStatusHistory).values({
        orderId: order.id,
        from: order.status,
        to: newStatus,
      })

      return updated
    })
  }
}
```

## Discriminated union — type-safe state

```ts
// shared/types/result.types.ts
export type Result<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error; code: string }

// usage in service
function parseInput(raw: unknown): Result<CreateUserInput> {
  const parsed = CreateUserDto.safeParse(raw)
  if (!parsed.success)
    return { status: 'error', error: parsed.error, code: 'VALIDATION_ERROR' }
  return { status: 'success', data: parsed.data }
}
```

## `satisfies` + `as const` — config and enums

```ts
// domains/users/users.constants.ts

// as const — preserves narrowest literal type for query keys, config arrays
export const USER_ROLES = ['admin', 'user'] as const
export type UserRole = typeof USER_ROLES[number]

// satisfies — validates shape without widening, catches missing keys at compile time
export const ROLE_LABELS = {
  admin: 'Administrator',
  user:  'Standard User',
} satisfies Record<UserRole, string>

// satisfies Record<K,V> → adding a new role to USER_ROLES causes a compile error
// if ROLE_LABELS doesn't also include it — exhaustive check for free
```
