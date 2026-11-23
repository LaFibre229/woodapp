import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { balancePayUrl, getOrderPayments, paymentSummary } from "../../../../lib/payments"

/** Deposit and balance state of an order, for the admin widget. */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const order = await getOrderPayments(req.scope, req.params.id)
  const { deposit, balance } = paymentSummary(order)
  res.json({
    deposit,
    balance,
    pay_url: order.metadata?.balance_token ? balancePayUrl(order) : null,
  })
}
