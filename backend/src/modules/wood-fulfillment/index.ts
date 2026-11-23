import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import WoodDeliveryProviderService from "./service"

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [WoodDeliveryProviderService],
})
