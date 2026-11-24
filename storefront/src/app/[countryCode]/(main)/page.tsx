import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { CATEGORY_COPY, sortCategories } from "@lib/util/category-display"
import { ArrowRight, Buildings, CreditCard, Fire, TruckFast } from "@medusajs/icons"
import Hero from "@modules/home/components/hero"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductArt, { productKind } from "@modules/products/components/product-art"
import ProductPreview from "@modules/products/components/product-preview"

const VALUES = [
  [Fire, "Dal sacco al camion", "Ogni prodotto in più formati: sacco, bancale o camion completo su preventivo."],
  [TruckFast, "Consegna in tutta Italia", "Con i nostri camion o con corriere bancali, isole comprese. Oppure ritiro in sede."],
  [CreditCard, "Acconto per prenotare", "Paghi una parte all'ordine e il saldo prima della consegna o al ritiro."],
  [Buildings, "Prezzi per aziende", "Registrati come azienda e vedi subito i tuoi prezzi IVA esclusa."],
] as const

const STEPS = [
  ["Scegli il formato", "Sacco, bancale o camion completo. Controlla subito se consegniamo al tuo CAP."],
  ["Paga l'acconto", "Con carta, PayPal o bonifico. Il saldo lo paghi prima della consegna o al ritiro."],
  ["Ricevi a casa", "Consegniamo con i nostri camion o con corriere bancali, nei tempi indicati per la tua zona."],
]

export default async function Home(props: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await props.params
  const [region, categories] = await Promise.all([getRegion(countryCode), listCategories()])

  if (!region) {
    return null
  }

  const topCategories = sortCategories((categories ?? []).filter((c) => !c.parent_category))
  const rails = await Promise.all(
    topCategories.map(async (category) => ({
      category,
      products: (
        await listProducts({
          regionId: region.id,
          queryParams: { category_id: [category.id], limit: 6 } as any,
        })
      ).response.products,
    }))
  )

  return (
    <>
      <Hero />

      {/* Reassurance strip */}
      <section className="border-b border-ui-border-base bg-cream-100">
        <div className="content-container grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-4 gap-x-8 gap-y-6 py-10">
          {VALUES.map(([Icon, title, text]) => (
            <div key={title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ember-100 text-ember-700">
                <Icon />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-[15px] text-bark-900">{title}</h3>
                <p className="text-[13px] leading-relaxed text-ui-fg-subtle">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {topCategories.length > 0 && (
        <section className="content-container py-14 small:py-20">
          <div className="flex flex-col gap-2 mb-8">
            <span className="eyebrow">Il nostro catalogo</span>
            <h2 className="font-display text-3xl small:text-[40px] leading-tight text-bark-900">
              Cosa stai cercando?
            </h2>
          </div>
          <ul className="grid grid-cols-1 xsmall:grid-cols-3 gap-3 xsmall:gap-4 small:gap-6">
            {topCategories.map((category) => (
              <li key={category.id}>
                {/* Phones: compact row */}
                <LocalizedClientLink
                  href={`/categories/${category.handle}`}
                  className="xsmall:hidden flex items-center gap-4 rounded-large bg-cream-100 p-3 pr-4 shadow-elevation-card-rest"
                >
                  <span className="relative h-24 w-24 shrink-0 overflow-hidden rounded-rounded">
                    <ProductArt kind={productKind(category.handle)} />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="font-display text-[22px] leading-tight text-bark-900">
                      {category.name}
                    </span>
                    <span className="text-[13px] leading-snug text-ui-fg-subtle">
                      {CATEGORY_COPY[category.handle] ?? category.description}
                    </span>
                  </span>
                  <ArrowRight className="ml-auto shrink-0 text-ember-600" />
                </LocalizedClientLink>
                {/* Larger screens: tall picture tile */}
                <LocalizedClientLink
                  href={`/categories/${category.handle}`}
                  className="group relative hidden xsmall:flex aspect-[3/4] small:aspect-[4/5] overflow-hidden rounded-large shadow-elevation-card-rest hover:shadow-elevation-card-hover transition-shadow"
                >
                  <ProductArt
                    kind={productKind(category.handle)}
                    className="transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bark-900/90 via-bark-900/10 to-transparent" />
                  <div className="relative mt-auto p-5 small:p-6 text-cream-50 flex flex-col gap-1">
                    <h3 className="font-display text-2xl small:text-[28px]">{category.name}</h3>
                    <p className="text-[13px] text-cream-200 max-w-[28ch]">
                      {CATEGORY_COPY[category.handle] ?? category.description}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-ember-300">
                      Scopri <ArrowRight className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Product rails */}
      {rails
        .filter((r) => r.products.length)
        .map(({ category, products }) => (
          <section key={category.id} className="content-container py-10 small:py-14">
            <div className="flex items-end justify-between gap-4 mb-6 small:mb-8">
              <h2 className="font-display text-2xl small:text-[32px] leading-tight text-bark-900">
                {category.name}
              </h2>
              <LocalizedClientLink
                href={`/categories/${category.handle}`}
                className="inline-flex items-center gap-1 text-[14px] font-medium text-ember-600 hover:text-ember-700 whitespace-nowrap"
              >
                Vedi tutti <ArrowRight />
              </LocalizedClientLink>
            </div>
            <ul className="grid grid-cols-2 small:grid-cols-4 gap-x-4 small:gap-x-6 gap-y-10">
              {products.map((product) => (
                <li key={product.id}>
                  <ProductPreview product={product} region={region} isFeatured />
                </li>
              ))}
            </ul>
          </section>
        ))}

      {/* How it works */}
      <section className="bg-cream-100 border-y border-ui-border-base mt-10">
        <div className="content-container py-14 small:py-20">
          <div className="flex flex-col gap-2 mb-10">
            <span className="eyebrow">Come funziona</span>
            <h2 className="font-display text-3xl small:text-[40px] leading-tight text-bark-900">
              Ordinare è semplice
            </h2>
          </div>
          <ol className="grid grid-cols-1 small:grid-cols-3 gap-8">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="flex gap-4">
                <span className="font-display text-[44px] leading-none text-ember-500">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-1 pt-1">
                  <h3 className="font-semibold text-[17px] text-bark-900">{title}</h3>
                  <p className="text-[14px] leading-relaxed text-ui-fg-subtle">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Business band */}
      <section className="content-container py-14 small:py-20">
        <div className="relative overflow-hidden rounded-[28px] bg-moss-700 text-cream-50 px-6 py-10 small:px-14 small:py-14 grid grid-cols-1 small:grid-cols-[1.4fr_1fr] gap-8 items-center">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-moss-500/40"
          />
          <div className="relative flex flex-col gap-3">
            <span className="eyebrow !text-moss-100">Per aziende</span>
            <h2 className="font-display text-3xl small:text-[40px] leading-tight">
              Pizzerie, panifici, hotel e rivenditori
            </h2>
            <p className="text-cream-200 text-[15px] leading-relaxed max-w-xl">
              Registrati come azienda per vedere i prezzi IVA esclusa e ricevere la
              fattura elettronica. Per grandi quantità chiedi un preventivo per il
              camion completo.
            </p>
          </div>
          <div className="relative flex flex-col xsmall:flex-row small:flex-col medium:flex-row gap-3 small:justify-end">
            <LocalizedClientLink href="/account" className="btn-ember">
              Registra l&apos;azienda
            </LocalizedClientLink>
            <LocalizedClientLink href="/preventivo" className="btn-outline-light">
              Preventivo camion
            </LocalizedClientLink>
          </div>
        </div>
      </section>
    </>
  )
}
