import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { createOrderPaymentCollectionWorkflow } from "@medusajs/medusa/core-flows"
import {
  balancePayUrl,
  getOrderPayments,
  newBalanceToken,
  paymentSummary,
} from "../../../../../lib/payments"

/**
 * "Demander le solde": opens a payment for the balance on the order and
 * returns the link to send to the customer (storefront /it/saldo/...). Calling
 * it again returns the same link.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  let order = await getOrderPayments(req.scope, req.params.id)
  const { balance } = paymentSummary(order)
  if (!(balance.amount > 0)) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Pas de solde à encaisser pour cette commande.")
  }
  const meta = { ...(order.metadata ?? {}) }
  if (!balance.payment_collection_id) {
    const { result } = await createOrderPaymentCollectionWorkflow(req.scope).run({
      input: { order_id: order.id, amount: balance.amount },
    })
    meta.balance_payment_collection_id = result[0].id
  }
  meta.balance_token = meta.balance_token || newBalanceToken()
  meta.balance_requested_at = meta.balance_requested_at || new Date().toISOString()
  await req.scope.resolve(Modules.ORDER).updateOrders([{ id: order.id, metadata: meta }])

  order = await getOrderPayments(req.scope, order.id)
  const summary = paymentSummary(order)
  res.json({ deposit: summary.deposit, balance: summary.balance, pay_url: balancePayUrl(order) })
}
