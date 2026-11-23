import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import {
  computeDeposit,
  depositPercentFor,
  getBusinessGroupId,
  getShopSettings,
  isBusinessCustomer,
} from "../../../../../lib/settings"
import { toNumber } from "../../../../../lib/zones"

/** Deposit (acconto) due now for a cart, and the balance (saldo) due later. */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "cart",
    fields: ["id", "total", "customer.metadata", "customer.groups.id"],
    filters: { id: req.params.id },
  })
  const cart = data[0] as any
  if (!cart) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Carrello non trovato")
  }
  const settings = await getShopSettings(req.scope)
  const business = isBusinessCustomer(cart.customer, await getBusinessGroupId(req.scope))
  const percent = depositPercentFor(settings, !!business)
  res.json({
    deposit: {
      ...computeDeposit(toNumber(cart.total), percent),
      customer_type: business ? "business" : "private",
    },
  })
}
