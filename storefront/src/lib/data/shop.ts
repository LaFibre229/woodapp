"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCartId } from "./cookies"

export type ShopSettings = {
  company_name: string
  legal_form: string | null
  vat_number: string | null
  tax_code: string | null
  rea_number: string | null
  share_capital: string | null
  pec: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  address_line: string | null
  postal_code: string | null
  city: string | null
  province: string | null
  opening_hours: string | null
  pickup_enabled: boolean
  pickup_address: string | null
  pickup_notes: string | null
  deposit_percent: number
  business_deposit_percent: number | null
}

export type DeliveryZone = {
  id: string
  name: string
  description: string | null
  carrier: "own_truck" | "pallet_carrier" | "courier"
  cap_rules: string[]
  provinces: string[]
  small_order_price: number
  price_per_pallet: number
  min_order_amount: number
  lead_time: string | null
}

export type DeliveryCheck = {
  covered: boolean
  cap?: string
  message?: string
  zone?: DeliveryZone
  estimate?: {
    pallets: number
    billable_pallets: number
    amount: number
    lead_time: string | null
  } | null
  pickup_enabled?: boolean
  pickup_address?: string | null
}

export type CartDeposit = {
  percent: number
  total: number
  deposit_amount: number
  balance_amount: number
  customer_type: "private" | "business"
}

const FALLBACK_SETTINGS: ShopSettings = {
  company_name: "Tempio del Riscaldamento",
  legal_form: null,
  vat_number: null,
  tax_code: null,
  rea_number: null,
  share_capital: null,
  pec: null,
  email: null,
  phone: null,
  whatsapp: null,
  address_line: null,
  postal_code: null,
  city: null,
  province: null,
  opening_hours: null,
  pickup_enabled: true,
  pickup_address: null,
  pickup_notes: null,
  deposit_percent: 50,
  business_deposit_percent: null,
}

/** Company details and shop rules edited in the admin. Cached for 5 minutes. */
export const getShopSettings = async (): Promise<ShopSettings> =>
  sdk.client
    .fetch<{ shop_settings: ShopSettings }>("/store/shop-settings", {
      next: { revalidate: 300, tags: ["shop-settings"] },
      cache: "force-cache",
    })
    .then(({ shop_settings }) => shop_settings)
    .catch(() => FALLBACK_SETTINGS)

export const listDeliveryZones = async (): Promise<DeliveryZone[]> =>
  sdk.client
    .fetch<{ delivery_zones: DeliveryZone[] }>("/store/delivery-zones", {
      next: { revalidate: 300, tags: ["delivery-zones"] },
      cache: "force-cache",
    })
    .then(({ delivery_zones }) => delivery_zones)
    .catch(() => [])

export const checkDelivery = async (
  cap: string,
  variantId?: string,
  quantity?: number
): Promise<DeliveryCheck> =>
  sdk.client
    .fetch<DeliveryCheck>("/store/delivery-zones/check", {
      query: {
        cap,
        ...(variantId ? { variant_id: variantId, quantity: quantity ?? 1 } : {}),
      },
      cache: "no-store",
    })
    .catch((e) => ({
      covered: false,
      message: e?.message || "Impossibile verificare il CAP. Riprova.",
    }))

export const getCartDeposit = async (cartId?: string): Promise<CartDeposit | null> => {
  const id = cartId || (await getCartId())
  if (!id) return null
  return sdk.client
    .fetch<{ deposit: CartDeposit }>(`/store/carts/${id}/deposit`, {
      headers: { ...(await getAuthHeaders()) },
      cache: "no-store",
    })
    .then(({ deposit }) => deposit)
    .catch(() => null)
}

export type QuoteRequestInput = {
  customer_type: "private" | "business"
  company_name?: string
  vat_number?: string
  first_name: string
  last_name?: string
  email: string
  phone?: string
  postal_code: string
  city?: string
  province?: string
  product_id?: string
  variant_id?: string
  product_title?: string
  quantity?: string
  desired_date?: string
  message?: string
}

export async function submitQuoteRequest(
  _state: { ok: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const get = (k: string) => {
    const v = formData.get(k)
    return typeof v === "string" && v.trim() ? v.trim() : undefined
  }
  const body: QuoteRequestInput = {
    customer_type: get("customer_type") === "private" ? "private" : "business",
    company_name: get("company_name"),
    vat_number: get("vat_number"),
    first_name: get("first_name") ?? "",
    last_name: get("last_name"),
    email: get("email") ?? "",
    phone: get("phone"),
    postal_code: get("postal_code") ?? "",
    city: get("city"),
    province: get("province")?.toUpperCase(),
    product_id: get("product_id"),
    variant_id: get("variant_id"),
    product_title: get("product_title"),
    quantity: get("quantity"),
    desired_date: get("desired_date"),
    message: get("message"),
  }
  if (!/^\d{5}$/.test(body.postal_code)) {
    return { ok: false, error: "Inserisci un CAP valido di 5 cifre." }
  }
  try {
    await sdk.client.fetch("/store/quote-requests", {
      method: "POST",
      body,
      headers: { ...(await getAuthHeaders()) },
    })
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message || "Invio non riuscito. Riprova." }
  }
}
