import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SHOP_SETTINGS_MODULE } from "../modules/shop-settings"
import type ShopSettingsModuleService from "../modules/shop-settings/service"
import { computeDeposit } from "./zones"

export const BUSINESS_GROUP_NAME = "Aziende"

export const getShopSettings = async (container: MedusaContainer) => {
  const service = container.resolve<ShopSettingsModuleService>(SHOP_SETTINGS_MODULE)
  return await service.getSettings()
}

/** Settings that are safe to show on the storefront. */
export const publicSettings = (s: Awaited<ReturnType<typeof getShopSettings>>) => ({
  company_name: s.company_name,
  legal_form: s.legal_form,
  vat_number: s.vat_number,
  tax_code: s.tax_code,
  rea_number: s.rea_number,
  share_capital: s.share_capital,
  pec: s.pec,
  email: s.email,
  phone: s.phone,
  whatsapp: s.whatsapp,
  address_line: s.address_line,
  postal_code: s.postal_code,
  city: s.city,
  province: s.province,
  opening_hours: s.opening_hours,
  pickup_enabled: s.pickup_enabled,
  pickup_address:
    s.pickup_address ||
    [s.address_line, [s.postal_code, s.city].filter(Boolean).join(" "), s.province && `(${s.province})`]
      .filter(Boolean)
      .join(", ") ||
    null,
  pickup_notes: s.pickup_notes,
  deposit_percent: s.deposit_percent,
  business_deposit_percent: s.business_deposit_percent,
})

/** Finds the business customer group: the one set in settings, else by name. */
export const getBusinessGroupId = async (container: MedusaContainer): Promise<string | null> => {
  const settings = await getShopSettings(container)
  if (settings.business_group_id) return settings.business_group_id
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "customer_group",
    fields: ["id"],
    filters: { name: BUSINESS_GROUP_NAME },
  })
  return data[0]?.id ?? null
}

export const isBusinessCustomer = (
  customer: { metadata?: Record<string, unknown> | null; groups?: { id: string }[] | null } | null | undefined,
  businessGroupId: string | null
) =>
  !!customer &&
  ((businessGroupId && customer.groups?.some((g) => g.id === businessGroupId)) ||
    customer.metadata?.customer_type === "business")

export const depositPercentFor = (
  settings: Awaited<ReturnType<typeof getShopSettings>>,
  isBusiness: boolean
) =>
  isBusiness && settings.business_deposit_percent !== null && settings.business_deposit_percent !== undefined
    ? settings.business_deposit_percent
    : settings.deposit_percent

export { computeDeposit }
