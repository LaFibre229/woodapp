import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DELIVERY_ZONE_MODULE } from "../../../modules/delivery-zone"
import type DeliveryZoneModuleService from "../../../modules/delivery-zone/service"
import { normalizeCap } from "../../../lib/zones"

/** Lets the admin test which zone serves a postcode. */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { cap, province } = req.query as Record<string, string | undefined>
  const normalized = normalizeCap(cap)
  if (!normalized) {
    return res.status(400).json({ covered: false, message: "Code postal invalide" })
  }
  const service = req.scope.resolve<DeliveryZoneModuleService>(DELIVERY_ZONE_MODULE)
  const zone = await service.findZone(normalized, province)
  res.json({ covered: !!zone, cap: normalized, zone })
}
