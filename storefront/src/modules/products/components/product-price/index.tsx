import { clx } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"
import { displayPrice, isQuoteOnly, sortedVariants } from "@lib/util/variant"

export default function ProductPrice({
  product,
  variant,
  quantity = 1,
  isBusiness = false,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  quantity?: number
  isBusiness?: boolean
}) {
  if (variant && isQuoteOnly(variant)) {
    return (
      <div className="flex flex-col">
        <span className="font-display text-[28px] leading-tight text-bark-900">Prezzo su preventivo</span>
        <span className="text-small-regular text-ui-fg-subtle">
          Ti rispondiamo con il prezzo migliore per la tua zona.
        </span>
      </div>
    )
  }

  const cheapest = sortedVariants(product)
    .map((v) => displayPrice(v, isBusiness))
    .filter(Boolean)
    .sort((a, b) => a!.amount - b!.amount)[0]
  const price = variant ? displayPrice(variant, isBusiness) : cheapest

  if (!price) {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
  }

  const fmt = (amount: number) =>
    convertToLocale({ amount, currency_code: price.currency_code })

  return (
    <div className="flex flex-col text-ui-fg-base">
      <span
        className={clx("font-display text-[32px] leading-tight text-bark-900", {
          "!text-ember-600": price.onSale,
        })}
      >
        {!variant && <span className="text-[18px]">A partire da </span>}
        <span data-testid="product-price" data-value={price.amount}>
          {fmt(price.amount)}
        </span>
        <span className="font-sans text-[13px] text-ui-fg-muted"> {price.vatLabel}</span>
      </span>
      {price.onSale && (
        <p className="text-small-regular">
          <span className="text-ui-fg-subtle">Prezzo pieno: </span>
          <span className="line-through">{fmt(price.original)}</span>
        </p>
      )}
      {variant && quantity > 1 && (
        <span className="text-small-regular text-ui-fg-subtle">
          {quantity} × {fmt(price.amount)} = {fmt(price.amount * quantity)}
        </span>
      )}
      {isBusiness && (
        <span className="text-small-regular text-ui-fg-interactive">Prezzo riservato alle aziende</span>
      )}
    </div>
  )
}
