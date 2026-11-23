import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { checkBalanceToken, getOrderPayments, paymentSummary } from "../../../../../lib/payments"
import { confirmBalancePaymentWorkflow } from "../../../../../workflows/confirm-balance-payment"
import type { StoreBalanceCompleteType } from "../../../../validators"

/**
 * Called by the balance page once Stripe has confirmed the payment (directly,
 * or after a redirect such as PayPal). Records the payment on the order.
 */
export const POST = async (
  req: MedusaRequest<StoreBalanceCompleteType>,
  res: MedusaResponse
) => {
  const order = await getOrderPayments(req.scope, req.params.id)
  checkBalanceToken(order, req.validatedBody.t)
  const { balancePc } = paymentSummary(order)
  const session = (balancePc?.payment_sessions ?? []).find((s: any) =>
    ["pending", "requires_more", "authorized"].includes(s.status)
  )
  if (!session) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Nessun pagamento da confermare")
  }
  await confirmBalancePaymentWorkflow(req.scope).run({
    input: { order_id: order.id, payment_session_id: session.id },
  })
  const updated = paymentSummary(await getOrderPayments(req.scope, order.id))
  res.json({ balance: updated.balance })
}
