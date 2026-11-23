import { Module } from "@medusajs/framework/utils"
import DeliveryZoneModuleService from "./service"

export const DELIVERY_ZONE_MODULE = "delivery_zone"

export default Module(DELIVERY_ZONE_MODULE, {
  service: DeliveryZoneModuleService,
})
