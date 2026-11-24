import { HttpTypes } from "@medusajs/types"
import { ChevronRightMini } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const category = product.categories?.[0]
  return (
    <div id="product-info" className="flex flex-col gap-y-3">
      <nav aria-label="Percorso" className="flex items-center gap-1 text-[13px] text-ui-fg-muted">
        <LocalizedClientLink href="/" className="hover:text-ember-600">
          Home
        </LocalizedClientLink>
        {category && (
          <>
            <ChevronRightMini />
            <LocalizedClientLink
              href={`/categories/${category.handle}`}
              className="hover:text-ember-600"
            >
              {category.name}
            </LocalizedClientLink>
          </>
        )}
      </nav>
      <h1
        className="font-display text-[32px] small:text-[44px] leading-[1.1] text-bark-900"
        data-testid="product-title"
      >
        {product.title}
      </h1>
      {product.subtitle && (
        <p className="text-[16px] font-medium text-ember-700">{product.subtitle}</p>
      )}
      {product.description && (
        <p
          className="text-[15px] leading-relaxed text-ui-fg-subtle whitespace-pre-line max-w-prose"
          data-testid="product-description"
        >
          {product.description}
        </p>
      )}
    </div>
  )
}

export default ProductInfo
