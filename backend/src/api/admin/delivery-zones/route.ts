import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DELIVERY_ZONE_MODULE } from "../../../modules/delivery-zone"
import type DeliveryZoneModuleService from "../../../modules/delivery-zone/service"
import type { AdminCreateDeliveryZoneType } from "../../validators"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve<DeliveryZoneModuleService>(DELIVERY_ZONE_MODULE)
  const [zones, count] = await service.listAndCountDeliveryZones(
    {},
    { order: { priority: "DESC", name: "ASC" } }
  )
  res.json({ delivery_zones: zones, count })
}

export const POST = async (
  req: MedusaRequest<AdminCreateDeliveryZoneType>,
  res: MedusaResponse
) => {
  const service = req.scope.resolve<DeliveryZoneModuleService>(DELIVERY_ZONE_MODULE)
  const zone = await service.createDeliveryZones(req.validatedBody as any)
  res.status(201).json({ delivery_zone: zone })
}
