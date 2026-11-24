import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import BonificoProviderService from "./service"

export default ModuleProvider(Modules.PAYMENT, {
  services: [BonificoProviderService],
})
