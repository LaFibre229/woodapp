import { notFound } from "next/navigation"
import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { CATEGORY_COPY } from "@lib/util/category-display"
import CatalogueHeader from "@modules/store/components/catalogue-header"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  return (
    <div data-testid="category-container">
      <CatalogueHeader
        title={category.name}
        description={category.description || CATEGORY_COPY[category.handle]}
        handle={category.handle}
        parents={[...parents].reverse()}
        data-testid="category-page-title"
      />
      <div className="content-container py-6 small:py-10 flex flex-col gap-6 small:gap-8">
        {!!category.category_children?.length && (
          <ul className="flex flex-wrap gap-2">
            {category.category_children.map((c) => (
              <li key={c.id}>
                <LocalizedClientLink
                  href={`/categories/${c.handle}`}
                  className="inline-flex h-9 items-center px-4 rounded-full bg-ember-50 text-ember-700 text-[13px] font-medium hover:bg-ember-100"
                >
                  {c.name}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        )}
        <RefinementList sortBy={sort} data-testid="sort-by-container" />
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={category.products?.length ?? 8}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={category.id}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}
