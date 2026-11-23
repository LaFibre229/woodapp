import { HttpTypes } from "@medusajs/types"

export const isQuoteOnly = (variant?: HttpTypes.StoreProductVariant | null) => {
  const q = (variant?.metadata as any)?.quote_only
  return q === true || q === "true"
}

/** Variants in the order set in the admin (bag → pallet → truck). */
export const sortedVariants = (product: HttpTypes.StoreProduct) =>
  [...(product.variants ?? [])].sort(
    (a: any, b: any) => (a.variant_rank ?? 0) - (b.variant_rank ?? 0)
  )

export const isInStock = (variant?: HttpTypes.StoreProductVariant | null) => {
  if (!variant) return false
  if (!variant.manage_inventory || variant.allow_backorder) return true
  return (variant.inventory_quantity ?? 0) > 0
}

/**
 * Price to show: VAT included for households, VAT excluded for businesses
 * (Italian consumer law requires VAT-included prices for consumers).
 */
export const displayPrice = (
  variant: HttpTypes.StoreProductVariant | undefined | null,
  isBusiness: boolean
) => {
  const cp: any = (variant as any)?.calculated_price
  if (!cp || cp.calculated_amount === null || cp.calculated_amount === undefined) return null
  const gross = cp.calculated_amount_with_tax ?? cp.calculated_amount
  const net = cp.calculated_amount_without_tax ?? cp.calculated_amount
  const originalGross = cp.original_amount_with_tax ?? cp.original_amount
  const originalNet = cp.original_amount_without_tax ?? cp.original_amount
  return {
    amount: isBusiness ? net : gross,
    original: isBusiness ? originalNet : originalGross,
    gross,
    net,
    currency_code: cp.currency_code as string,
    onSale: cp.calculated_price?.price_list_type === "sale" && originalGross > gross,
    vatLabel: isBusiness ? "IVA esclusa" : "IVA inclusa",
  }
}

/** True when the logged-in customer signed up as a business. */
export const isBusinessCustomer = (customer: HttpTypes.StoreCustomer | null | undefined) =>
  (customer?.metadata as any)?.customer_type === "business"
