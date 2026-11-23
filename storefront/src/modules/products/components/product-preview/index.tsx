import { Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import { productKind } from "../product-art"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const kind = productKind(
    product.handle,
    ...(product.categories ?? []).map((c) => c.handle)
  )
  const formats = product.variants?.length ?? 0

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block h-full"
    >
      <div data-testid="product-wrapper" className="flex flex-col h-full">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
          kind={kind}
        />
        <div className="flex flex-col gap-1 mt-3 small:mt-4">
          <Text
            className="font-display text-[17px] small:text-[19px] leading-snug text-bark-900 group-hover:text-ember-600 transition-colors"
            data-testid="product-title"
          >
            {product.title}
          </Text>
          {product.subtitle && (
            <Text className="txt-small text-ui-fg-muted line-clamp-1">
              {product.subtitle}
            </Text>
          )}
          <div className="flex items-baseline justify-between gap-x-2 mt-1">
            <div className="flex items-baseline gap-x-2">
              {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
            </div>
            {formats > 1 && (
              <span className="hidden xsmall:inline text-[12px] text-ui-fg-muted">
                {formats} formati
              </span>
            )}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
