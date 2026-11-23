import { MedusaService } from "@medusajs/framework/utils"
import ShopSettings from "./models/shop-settings"

export type ShopSettingsData = Awaited<
  ReturnType<ShopSettingsModuleService["listShopSettings"]>
>[number]

class ShopSettingsModuleService extends MedusaService({ ShopSettings }) {
  /** Returns the single settings row, creating it with defaults if missing. */
  async getSettings(): Promise<ShopSettingsData> {
    const [existing] = await this.listShopSettings({}, { take: 1 })
    if (existing) {
      return existing
    }
    return await this.createShopSettings({})
  }

  async updateSettings(
    data: Partial<Omit<ShopSettingsData, "id" | "created_at" | "updated_at" | "deleted_at">>
  ): Promise<ShopSettingsData> {
    const current = await this.getSettings()
    return await this.updateShopSettings({ id: current.id, ...data } as any)
  }
}

export default ShopSettingsModuleService
