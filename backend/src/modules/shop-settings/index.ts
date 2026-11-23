import { Module } from "@medusajs/framework/utils"
import ShopSettingsModuleService from "./service"

export const SHOP_SETTINGS_MODULE = "shop_settings"

export default Module(SHOP_SETTINGS_MODULE, {
  service: ShopSettingsModuleService,
})
