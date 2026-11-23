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
    fields: ["id", "total", "metadata", "customer.metadata", "customer.groups.id"],
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
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
