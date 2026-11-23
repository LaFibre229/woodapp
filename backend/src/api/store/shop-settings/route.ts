import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getShopSettings, publicSettings } from "../../../lib/settings"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const settings = await getShopSettings(req.scope)
  res.json({ shop_settings: publicSettings(settings) })
}
