import { model } from "@medusajs/framework/utils"

/**
 * Single row holding the company details and shop rules that the owner edits
 * from the admin (Paramètres boutique). Nothing here is hard-coded in the code.
 */
const ShopSettings = model.define("shop_settings", {
  id: model.id({ prefix: "shopset" }).primaryKey(),
  // Company details (filled in once the company exists)
  company_name: model.text().default("Tempio del Riscaldamento"),
  legal_form: model.text().nullable(),
  vat_number: model.text().nullable(),
  tax_code: model.text().nullable(),
  rea_number: model.text().nullable(),
  share_capital: model.text().nullable(),
  pec: model.text().nullable(),
  sdi_code: model.text().nullable(),
  email: model.text().nullable(),
  phone: model.text().nullable(),
  whatsapp: model.text().nullable(),
  // Business address, also used as the pickup point unless pickup_* is set
  address_line: model.text().nullable(),
  postal_code: model.text().nullable(),
  city: model.text().nullable(),
  province: model.text().nullable(),
  opening_hours: model.text().nullable(),
  // Pickup (ritiro in sede)
  pickup_enabled: model.boolean().default(true),
  pickup_address: model.text().nullable(),
  pickup_notes: model.text().nullable(),
  // Deposit (acconto) taken at checkout, in percent of the order total
  deposit_percent: model.number().default(50),
  business_deposit_percent: model.number().nullable(),
  // Customer group that gets business prices on sign-up
  business_group_id: model.text().nullable(),
})

export default ShopSettings
