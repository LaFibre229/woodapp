import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import { productKind } from "@modules/products/components/product-art"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const kind = productKind(
    product.handle,
    ...(product.categories ?? []).map((c) => c.handle)
  )

  return (
    <>
      <div
        className="content-container grid grid-cols-1 small:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-8 small:gap-14 pt-4 pb-10 small:py-12"
        data-testid="product-container"
      >
        <div className="small:sticky small:top-32 self-start w-full">
          <ImageGallery images={images} kind={kind} />
        </div>
        <div className="flex flex-col gap-y-8 w-full">
          <ProductInfo product={product} />
          <div className="rounded-large bg-cream-100 border border-ui-border-base p-5 small:p-7">
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
          </div>
          <ProductTabs product={product} />
        </div>
      </div>
      <div
        className="content-container my-12 small:my-24"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
