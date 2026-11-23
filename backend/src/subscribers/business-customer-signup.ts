import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { getBusinessGroupId } from "../lib/settings"

/**
 * A customer who signs up as a business (metadata.customer_type = "business")
 * is added to the business customer group right away, so business price lists
 * apply with no manual check (decision of 23 Nov 2026).
 */
export default async function businessCustomerSignup({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const customerModule = container.resolve(Modules.CUSTOMER)
  const logger = container.resolve("logger")
  const customer = await customerModule.retrieveCustomer(data.id)
  if (customer.metadata?.customer_type !== "business") {
    return
  }
  const groupId = await getBusinessGroupId(container)
  if (!groupId) {
    logger.warn(`Business customer ${customer.id} signed up but no business group exists`)
    return
  }
  await customerModule.addCustomerToGroup({
    customer_id: customer.id,
    customer_group_id: groupId,
  })
  logger.info(`Customer ${customer.email} added to the business group`)
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
