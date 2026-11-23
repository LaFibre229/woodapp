import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { createPaymentSessionsWorkflow } from "@medusajs/medusa/core-flows"
import {
  checkBalanceToken,
  enabledBalanceProviders,
  getOrderPayments,
  paymentSummary,
  STRIPE_PROVIDER_ID,
} from "../../../../../lib/payments"
import type { StoreBalanceSessionType } from "../../../../validators"

/** Starts an online payment (Stripe) for the balance of an order. */
export const POST = async (
  req: MedusaRequest<StoreBalanceSessionType>,
  res: MedusaResponse
) => {
  const order = await getOrderPayments(req.scope, req.params.id)
  checkBalanceToken(order, req.validatedBody.t)
  const { balance, balancePc } = paymentSummary(order)
  if (!balancePc || balance.state !== "awaiting") {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Il saldo non è da pagare")
  }
  if (!(await enabledBalanceProviders(req.scope)).includes(STRIPE_PROVIDER_ID)) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Il pagamento online non è disponibile")
  }
  const existing = (balancePc.payment_sessions ?? []).find(
    (s: any) => s.status === "pending" && s.provider_id === STRIPE_PROVIDER_ID
  )
  const session =
    existing ??
    (
      await createPaymentSessionsWorkflow(req.scope).run({
        input: {
          payment_collection_id: balancePc.id,
          provider_id: STRIPE_PROVIDER_ID,
          context: { email: order.email },
        } as any,
      })
    ).result
  res.json({
    session: {
      id: session.id,
      provider_id: session.provider_id,
      client_secret: (session.data as any)?.client_secret ?? null,
    },
  })
}
