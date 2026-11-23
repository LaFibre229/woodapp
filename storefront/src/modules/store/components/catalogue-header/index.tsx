import { ChevronRightMini } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductArt, { productKind } from "@modules/products/components/product-art"

type Crumb = { name: string; handle: string }

/** Title banner for the catalogue and category pages. */
const CatalogueHeader = ({
  title,
  description,
  handle,
  parents = [],
  "data-testid": dataTestId,
}: {
  title: string
  description?: string | null
  handle?: string
  parents?: Crumb[]
  "data-testid"?: string
}) => {
  const kind = productKind(handle)

  return (
    <section className="bg-cream-100 border-b border-ui-border-base">
      <div className="content-container flex items-center justify-between gap-6 py-8 small:py-12">
        <div className="flex flex-col gap-3 max-w-2xl">
          <nav aria-label="Percorso" className="flex flex-wrap items-center gap-1 text-[13px] text-ui-fg-muted">
            <LocalizedClientLink href="/" className="hover:text-ember-600">
              Home
            </LocalizedClientLink>
            {parents.map((p) => (
              <span key={p.handle} className="flex items-center gap-1">
                <ChevronRightMini />
                <LocalizedClientLink
                  href={`/categories/${p.handle}`}
                  className="hover:text-ember-600"
                  data-testid="sort-by-link"
                >
                  {p.name}
                </LocalizedClientLink>
              </span>
            ))}
          </nav>
          <h1
            className="font-display text-[36px] small:text-[52px] leading-[1.05] text-bark-900"
            data-testid={dataTestId}
          >
            {title}
          </h1>
          {description && (
            <p className="text-[15px] small:text-[16px] leading-relaxed text-ui-fg-subtle">
              {description}
            </p>
          )}
        </div>
        {kind !== "other" && (
          <div className="relative hidden xsmall:block h-32 w-32 small:h-44 small:w-44 shrink-0 overflow-hidden rounded-full ring-4 ring-cream-50 shadow-elevation-card-rest">
            <ProductArt kind={kind} />
          </div>
        )}
      </div>
    </section>
  )
}

export default CatalogueHeader
