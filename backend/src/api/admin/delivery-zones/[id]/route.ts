import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DELIVERY_ZONE_MODULE } from "../../../../modules/delivery-zone"
import type DeliveryZoneModuleService from "../../../../modules/delivery-zone/service"
import type { AdminUpdateDeliveryZoneType } from "../../../validators"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve<DeliveryZoneModuleService>(DELIVERY_ZONE_MODULE)
  res.json({ delivery_zone: await service.retrieveDeliveryZone(req.params.id) })
}

export const POST = async (
  req: MedusaRequest<AdminUpdateDeliveryZoneType>,
  res: MedusaResponse
) => {
  const service = req.scope.resolve<DeliveryZoneModuleService>(DELIVERY_ZONE_MODULE)
  const zone = await service.updateDeliveryZones({
    id: req.params.id,
    ...req.validatedBody,
  } as any)
  res.json({ delivery_zone: zone })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve<DeliveryZoneModuleService>(DELIVERY_ZONE_MODULE)
  await service.deleteDeliveryZones(req.params.id)
  res.json({ id: req.params.id, object: "delivery_zone", deleted: true })
}
