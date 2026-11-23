import { z } from "@medusajs/framework/zod"

const optionalText = z.string().trim().max(2000).nullish()

export const StoreCreateQuoteRequest = z.object({
  customer_type: z.enum(["private", "business"]).default("business"),
  company_name: optionalText,
  vat_number: optionalText,
  first_name: z.string().trim().min(1).max(200),
  last_name: optionalText,
  email: z.string().trim().email(),
  phone: optionalText,
  postal_code: z.string().trim().regex(/^\d{5}$/, "CAP non valido"),
  city: optionalText,
  province: optionalText,
  product_id: optionalText,
  variant_id: optionalText,
  product_title: optionalText,
  quantity: optionalText,
  desired_date: optionalText,
  message: optionalText,
})
export type StoreCreateQuoteRequestType = z.infer<typeof StoreCreateQuoteRequest>

const percent = z.coerce.number().min(0).max(100)

export const AdminUpdateShopSettings = z
  .object({
    company_name: z.string().trim().min(1),
    legal_form: optionalText,
    vat_number: optionalText,
    tax_code: optionalText,
    rea_number: optionalText,
    share_capital: optionalText,
    pec: optionalText,
    sdi_code: optionalText,
    email: optionalText,
    phone: optionalText,
    whatsapp: optionalText,
    address_line: optionalText,
    postal_code: optionalText,
    city: optionalText,
    province: optionalText,
    opening_hours: optionalText,
    pickup_enabled: z.boolean(),
    pickup_address: optionalText,
    pickup_notes: optionalText,
    deposit_percent: percent,
    business_deposit_percent: percent.nullish(),
    business_group_id: optionalText,
    bank_beneficiary: optionalText,
    bank_iban: optionalText.transform((v) => (v ? v.replace(/\s+/g, "").toUpperCase() : v)),
    bank_bic: optionalText,
    bank_name: optionalText,
  })
  .partial()
export type AdminUpdateShopSettingsType = z.infer<typeof AdminUpdateShopSettings>

const stringList = z
  .union([z.array(z.string()), z.string()])
  .transform((v) =>
    (Array.isArray(v) ? v : v.split(/[,;\n]/))
      .map((s) => s.trim())
      .filter(Boolean)
  )

const money = z.coerce.number().min(0)

export const AdminCreateDeliveryZone = z.object({
  name: z.string().trim().min(1),
  description: optionalText,
  active: z.boolean().default(true),
  cap_rules: stringList.default([]),
  provinces: stringList.default([]),
  carrier: z.enum(["own_truck", "pallet_carrier", "courier"]).default("pallet_carrier"),
  small_order_price: money.default(0),
  price_per_pallet: money.default(0),
  min_order_amount: money.default(0),
  lead_time: optionalText,
  priority: z.coerce.number().int().default(0),
})
export type AdminCreateDeliveryZoneType = z.infer<typeof AdminCreateDeliveryZone>

export const AdminUpdateDeliveryZone = AdminCreateDeliveryZone.partial()
export type AdminUpdateDeliveryZoneType = z.infer<typeof AdminUpdateDeliveryZone>

export const AdminUpdateQuoteRequest = z.object({
  status: z.enum(["new", "contacted", "quoted", "won", "lost"]).optional(),
  admin_notes: optionalText,
})
export type AdminUpdateQuoteRequestType = z.infer<typeof AdminUpdateQuoteRequest>

export const StoreBalanceSession = z.object({ t: z.string().min(10) })
export type StoreBalanceSessionType = z.infer<typeof StoreBalanceSession>

export const StoreBalanceComplete = z.object({ t: z.string().min(10) })
export type StoreBalanceCompleteType = z.infer<typeof StoreBalanceComplete>

export const AdminMarkPaid = z.object({ part: z.enum(["deposit", "balance"]) })
export type AdminMarkPaidType = z.infer<typeof AdminMarkPaid>
