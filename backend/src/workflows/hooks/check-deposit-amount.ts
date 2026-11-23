import { completeCartWorkflow } from "@medusajs/medusa/core-flows"
import { assertSessionMatchesDeposit } from "../../lib/payments"

/**
 * Only the deposit is charged when the order is placed. Before the payment is
 * authorized, check that the session amount still equals the deposit for the
 * current cart total (it would not if the cart changed after the payment step).
 */
completeCartWorkflow.hooks.validate(async ({ cart }, { container }) => {
  await assertSessionMatchesDeposit(container, (cart as any).id)
})
