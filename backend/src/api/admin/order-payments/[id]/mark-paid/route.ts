import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import {
  capturePaymentWorkflow,
  markPaymentCollectionAsPaid,
} from "@medusajs/medusa/core-flows"
import { balancePayUrl, getOrderPayments, paymentSummary } from "../../../../../lib/payments"
import type { AdminMarkPaidType } from "../../../../validators"

/**
 * Records money received outside the site (bank transfer, cash at pickup or
 * delivery) for the deposit or the balance:
 * - a payment already authorized (bonifico chosen at checkout) is captured;
 * - otherwise the payment collection is marked as paid.
 */
export const POST = async (
  req: AuthenticatedMedusaRequest<AdminMarkPaidType>,
  res: MedusaResponse
) => {
  const order = await getOrderPayments(req.scope, req.params.id)
  const { part } = req.validatedBody
  const summary = paymentSummary(order)
  const meta = order.metadata ?? {}
  const collections = order.payment_collections ?? []
  const pc =
    part === "balance"
      ? summary.balancePc
      : collections
          .filter((c: any) => c.id !== meta.balance_payment_collection_id)
          .sort((a: any, b: any) => +new Date(a.created_at) - +new Date(b.created_at))[0]

  if (!pc) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      part === "balance"
        ? "Demandez d'abord le solde pour cette commande."
        : "Aucun paiement d'acompte sur cette commande."
    )
  }
  if (summary[part].state === "paid") {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Déjà encaissé.")
  }

  const actor = req.auth_context?.actor_id
  const authorized = (pc.payments ?? []).find((p: any) => !p.canceled_at && !p.captured_at)
  if (authorized) {
    await capturePaymentWorkflow(req.scope).run({
      input: { payment_id: authorized.id, captured_by: actor },
    })
  } else {
    await markPaymentCollectionAsPaid(req.scope).run({
      input: { payment_collection_id: pc.id, order_id: order.id, captured_by: actor },
    })
  }

  const updated = await getOrderPayments(req.scope, order.id)
  const { deposit, balance } = paymentSummary(updated)
  res.json({
    deposit,
    balance,
    pay_url: updated.metadata?.balance_token ? balancePayUrl(updated) : null,
  })
}
