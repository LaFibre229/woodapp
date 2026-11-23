import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"
import { linkPaymentProviders } from "../lib/payment-setup"

/**
 * Turns on every installed payment provider for the Italy region: bank
 * transfer always, Stripe once STRIPE_API_KEY is set in backend/.env.
 * Run with `pnpm payments:setup` after adding or changing the Stripe key.
 */
export default async function setupPayments({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const ids = await linkPaymentProviders(container, updateRegionsWorkflow)
  logger.info(`Payment providers enabled for Italia: ${ids.join(", ")}`)
  if (!ids.includes("pp_stripe_stripe")) {
    logger.warn("Stripe is not enabled: set STRIPE_API_KEY in backend/.env and run this again.")
  }
}
