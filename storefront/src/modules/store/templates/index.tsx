import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import CatalogueHeader from "@modules/store/components/catalogue-header"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div data-testid="category-container">
      <CatalogueHeader
        title="Tutti i prodotti"
        description="Legna da ardere, pellet e stufe: scegli il formato che ti serve, dal sacco al bancale."
        data-testid="store-page-title"
      />
      <div className="content-container py-6 small:py-10 flex flex-col gap-6 small:gap-8">
        <RefinementList sortBy={sort} />
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
