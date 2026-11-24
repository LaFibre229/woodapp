import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  computeDeposit,
  depositPercentFor,
  getBusinessGroupId,
  getShopSettings,
  isBusinessCustomer,
} from "../lib/settings"
import { toNumber } from "../lib/zones"

/**
 * Stores the deposit (acconto) and balance (saldo) on each new order, using the
 * percentage set in the admin when the order is placed. The payments layer will
 * charge the deposit at checkout and the balance before delivery or at pickup.
 *
 * The order already carries the cart metadata, including the invoice details
 * collected at checkout (metadata.invoice).
 */
export default async function orderDeposit({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "total",
      "metadata",
      "customer.metadata",
      "customer.groups.id",
      "payment_collections.id",
      "payment_collections.amount",
      "payment_collections.status",
      "payment_collections.authorized_amount",
      "payment_collections.captured_amount",
      "payment_collections.payment_sessions.amount",
    ],
    filters: { id: data.id },
  })
  const order = orders[0] as any
  if (!order || order.metadata?.deposit_amount !== undefined) return

  const settings = await getShopSettings(container)
  const business =
    isBusinessCustomer(order.customer, await getBusinessGroupId(container)) ||
    order.metadata?.customer_type === "business"
  const deposit = computeDeposit(toNumber(order.total), depositPercentFor(settings, !!business))

  await container.resolve(Modules.ORDER).updateOrders([
    {
      id: order.id,
      metadata: {
        ...(order.metadata ?? {}),
        customer_type: business ? "business" : "private",
        deposit_percent: deposit.percent,
        deposit_amount: deposit.deposit_amount,
        balance_amount: deposit.balance_amount,
        deposit_status: "pending",
        balance_status: "pending",
      },
    },
  ])

  // The checkout charged only the deposit: size the order's payment
  // collection to it, so the order reads as paid for that part and the
  // balance is requested later as its own payment.
  const pc = (order.payment_collections ?? [])[0]
  const sessionAmount = toNumber(pc?.payment_sessions?.[0]?.amount)
  if (
    pc &&
    deposit.balance_amount > 0 &&
    Math.abs(sessionAmount - deposit.deposit_amount) < 0.005 &&
    Math.abs(toNumber(pc.amount) - deposit.deposit_amount) >= 0.005
  ) {
    // Medusa does not recompute the status on an amount change, so apply the
    // same rule as the payment module: covered by authorizations/captures.
    const covers = (v: unknown) => toNumber(v) + 0.005 >= deposit.deposit_amount
    const status = covers(pc.captured_amount)
      ? "completed"
      : covers(pc.authorized_amount)
        ? "authorized"
        : pc.status
    await container.resolve(Modules.PAYMENT).updatePaymentCollections(pc.id, {
      amount: deposit.deposit_amount,
      status,
    } as any)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
