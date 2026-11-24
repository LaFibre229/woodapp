"use client"

import { addToCart } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import {
  displayPrice,
  isInStock,
  isQuoteOnly,
  sortedVariants,
} from "@lib/util/variant"
import { HttpTypes } from "@medusajs/types"
import { Button, clx } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import DeliveryCheck from "@modules/shop/components/delivery-check"
import QuoteRequestForm from "@modules/shop/components/quote-request-form"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import ProductPrice from "../product-price"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
  isBusiness?: boolean
  customer?: HttpTypes.StoreCustomer | null
}

/**
 * Format picker (bag, pallet, truck…), quantity, price, add to cart, and for
 * quote-only formats a quote request form instead of the cart button.
 */
export default function ProductActions({
  product,
  disabled,
  isBusiness = false,
  customer,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const countryCode = useParams().countryCode as string

  const variants = useMemo(() => sortedVariants(product), [product])
  const initialId =
    searchParams.get("v_id") && variants.some((v) => v.id === searchParams.get("v_id"))
      ? searchParams.get("v_id")
      : variants.find((v) => !isQuoteOnly(v) && isInStock(v))?.id ?? variants[0]?.id

  const [variantId, setVariantId] = useState<string | null | undefined>(initialId)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedVariant = variants.find((v) => v.id === variantId)
  const quoteOnly = isQuoteOnly(selectedVariant)
  const inStock = isInStock(selectedVariant)
  const maxQty =
    selectedVariant?.manage_inventory && !selectedVariant.allow_backorder
      ? Math.max(1, selectedVariant.inventory_quantity ?? 1)
      : 999

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (!variantId || params.get("v_id") === variantId) return
    params.set("v_id", variantId)
    router.replace(pathname + "?" + params.toString(), { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantId])

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return
    setIsAdding(true)
    setError(null)
    try {
      await addToCart({ variantId: selectedVariant.id, quantity, countryCode })
      setAdded(true)
      setTimeout(() => setAdded(false), 2500)
    } catch (e: any) {
      setError(e?.message ?? "Impossibile aggiungere al carrello")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="flex flex-col gap-y-4">
      {variants.length > 1 && (
        <div className="flex flex-col gap-y-3">
          <span className="eyebrow">Scegli il formato</span>
          <div className="flex flex-col gap-2" data-testid="product-options">
            {variants.map((v) => {
              const price = displayPrice(v, isBusiness)
              const active = v.id === variantId
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setVariantId(v.id)
                    setQuantity(1)
                  }}
                  disabled={!!disabled || isAdding}
                  data-testid="option-button"
                  className={clx(
                    "flex items-center justify-between gap-3 border rounded-rounded px-4 min-h-[52px] py-2 text-[14px] text-left transition-colors",
                    active
                      ? "border-ember-500 bg-ember-50 ring-1 ring-ember-500"
                      : "border-ui-border-strong bg-cream-50 hover:border-bark-500"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={clx(
                        "h-4 w-4 shrink-0 rounded-full border-2",
                        active ? "border-ember-500 bg-[radial-gradient(circle,#C9562A_45%,transparent_50%)]" : "border-ui-border-strong"
                      )}
                    />
                    <span className={clx("font-medium", active ? "text-bark-900" : "text-bark-700")}>
                      {v.title}
                    </span>
                  </span>
                  <span className={clx("whitespace-nowrap", active ? "text-bark-900 font-semibold" : "text-ui-fg-subtle")}>
                    {isQuoteOnly(v)
                      ? "Su preventivo"
                      : price
                      ? convertToLocale({ amount: price.amount, currency_code: price.currency_code })
                      : ""}
                  </span>
                </button>
              )
            })}
          </div>
          <Divider />
        </div>
      )}

      <ProductPrice
        product={product}
        variant={selectedVariant}
        quantity={quantity}
        isBusiness={isBusiness}
      />

      {quoteOnly ? (
        <QuoteRequestForm
          product={product}
          variant={selectedVariant}
          customer={customer}
          compact
        />
      ) : (
        <>
          <div className="flex items-center gap-x-2">
            <label htmlFor="quantity" className="text-[14px] text-ui-fg-subtle">
              Quantità
            </label>
            <div className="flex items-center border rounded-full border-ui-border-strong bg-cream-50">
              <button
                type="button"
                className="px-4 h-11 text-lg text-bark-700"
                aria-label="Diminuisci"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <input
                id="quantity"
                type="number"
                min={1}
                max={maxQty}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.min(maxQty, Math.max(1, Number(e.target.value) || 1)))
                }
                className="w-12 text-center h-11 bg-transparent outline-none font-medium [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                data-testid="quantity-input"
              />
              <button
                type="button"
                className="px-4 h-11 text-lg text-bark-700"
                aria-label="Aumenta"
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              >
                +
              </button>
            </div>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={!inStock || !selectedVariant || !!disabled || isAdding}
            variant="primary"
            className="w-full h-12 !rounded-full text-[15px]"
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            {!selectedVariant
              ? "Scegli un formato"
              : !inStock
              ? "Esaurito"
              : added
              ? "Aggiunto al carrello ✓"
              : "Aggiungi al carrello"}
          </Button>
          {error && <p className="text-small-regular text-rose-500">{error}</p>}
          {!inStock && selectedVariant && (
            <p className="text-small-regular text-ui-fg-subtle">
              Questo formato è al momento esaurito. Puoi chiederci un preventivo per una
              consegna futura.
            </p>
          )}
        </>
      )}

      <Divider />
      <DeliveryCheck variantId={quoteOnly ? undefined : selectedVariant?.id} quantity={quantity} />
    </div>
  )
}
