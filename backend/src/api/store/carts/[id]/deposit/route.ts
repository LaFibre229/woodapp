import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { cartDeposit } from "../../../../../lib/payments"

/** Deposit (acconto) due now for a cart, and the balance (saldo) due later. */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { business, deposit } = await cartDeposit(req.scope, req.params.id)
  res.json({
    deposit: {
      ...deposit,
      customer_type: business ? "business" : "private",
    },
  })
}
