import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { applyDepositToSession } from "../../../../../../lib/payments"

/**
 * Called by the storefront right after a payment session is created: sets the
 * session to the deposit amount, so only the deposit is charged at checkout.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const deposit = await applyDepositToSession(req.scope, req.params.id)
  res.json({ deposit })
}
