import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { bankDetails, getShopSettings } from "../../../../lib/settings"
import {
  checkBalanceToken,
  enabledBalanceProviders,
  getOrderPayments,
  paymentSummary,
} from "../../../../lib/payments"

/**
 * Balance (saldo) payment page data. Reached from the link the shop sends
 * before delivery: /it/saldo/:order_id?t=token. The token stands in for a
 * login so guests can pay too.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const order = await getOrderPayments(req.scope, req.params.id)
  checkBalanceToken(order, req.query.t)
  const { deposit, balance, balancePc } = paymentSummary(order)
  const session = (balancePc?.payment_sessions ?? []).find((s: any) =>
    ["pending", "requires_more"].includes(s.status)
  )
  const settings = await getShopSettings(req.scope)
  res.json({
    order: {
      id: order.id,
      display_id: order.display_id,
      currency_code: order.currency_code,
      total: order.total,
    },
    deposit,
    balance,
    providers: await enabledBalanceProviders(req.scope),
    bank_transfer: bankDetails(settings),
    session: session
      ? {
          id: session.id,
          provider_id: session.provider_id,
          client_secret: session.data?.client_secret ?? null,
        }
      : null,
  })
}
