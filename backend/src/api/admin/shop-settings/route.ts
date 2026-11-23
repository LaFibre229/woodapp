import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SHOP_SETTINGS_MODULE } from "../../../modules/shop-settings"
import type ShopSettingsModuleService from "../../../modules/shop-settings/service"
import type { AdminUpdateShopSettingsType } from "../../validators"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve<ShopSettingsModuleService>(SHOP_SETTINGS_MODULE)
  res.json({ shop_settings: await service.getSettings() })
}

export const POST = async (
  req: MedusaRequest<AdminUpdateShopSettingsType>,
  res: MedusaResponse
) => {
  const service = req.scope.resolve<ShopSettingsModuleService>(SHOP_SETTINGS_MODULE)
  const updated = await service.updateSettings(req.validatedBody as any)
  res.json({ shop_settings: updated })
}
