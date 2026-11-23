import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DELIVERY_ZONE_MODULE } from "../../../modules/delivery-zone"
import type DeliveryZoneModuleService from "../../../modules/delivery-zone/service"
import { asStringArray, toNumber } from "../../../lib/zones"

export const publicZone = (z: any) => ({
  id: z.id,
  name: z.name,
  description: z.description,
  carrier: z.carrier,
  cap_rules: asStringArray(z.cap_rules),
  provinces: asStringArray(z.provinces),
  small_order_price: toNumber(z.small_order_price),
  price_per_pallet: toNumber(z.price_per_pallet),
  min_order_amount: toNumber(z.min_order_amount),
  lead_time: z.lead_time,
})

/** Covered zones, for the public "Dove consegniamo" page. */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve<DeliveryZoneModuleService>(DELIVERY_ZONE_MODULE)
  const zones = await service.listDeliveryZones(
    { active: true },
    { order: { priority: "DESC", name: "ASC" } }
  )
  res.json({ delivery_zones: zones.map(publicZone) })
}
