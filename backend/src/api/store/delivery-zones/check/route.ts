import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { DELIVERY_ZONE_MODULE } from "../../../../modules/delivery-zone"
import type DeliveryZoneModuleService from "../../../../modules/delivery-zone/service"
import { normalizeCap, palletsForItems, quoteDelivery, toNumber } from "../../../../lib/zones"
import { getShopSettings, publicSettings } from "../../../../lib/settings"
import { publicZone } from "../route"

/**
 * "Consegnate da me?" check.
 * GET /store/delivery-zones/check?cap=20121[&province=MI][&variant_id=...&quantity=1]
 * With a variant it also estimates the delivery price for that quantity.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { cap, province, variant_id, quantity } = req.query as Record<string, string | undefined>
  const normalized = normalizeCap(cap)
  const settings = publicSettings(await getShopSettings(req.scope))

  if (!normalized) {
    return res.status(400).json({
      covered: false,
      message: "Inserisci un CAP valido di 5 cifre.",
    })
  }

  const service = req.scope.resolve<DeliveryZoneModuleService>(DELIVERY_ZONE_MODULE)
  const zone = await service.findZone(normalized, province)

  if (!zone) {
    return res.json({
      covered: false,
      cap: normalized,
      pickup_enabled: settings.pickup_enabled,
      pickup_address: settings.pickup_address,
      message: `Al momento non consegniamo al CAP ${normalized}.`,
    })
  }

  let estimate: ReturnType<typeof quoteDelivery> | null = null
  if (variant_id) {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "product_variant",
      fields: ["id", "metadata", "weight"],
      filters: { id: variant_id },
    })
    const v = data[0] as any
    if (v) {
      const perUnit = toNumber(v.metadata?.pallets) || (v.weight ? Number(v.weight) / 1000 : 0)
      estimate = quoteDelivery(
        zone as any,
        palletsForItems([{ quantity: Number(quantity) || 1, pallets_per_unit: perUnit }])
      )
    }
  }

  res.json({
    covered: true,
    cap: normalized,
    zone: publicZone(zone),
    estimate,
    pickup_enabled: settings.pickup_enabled,
    pickup_address: settings.pickup_address,
  })
}
