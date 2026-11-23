import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { Text } from "@medusajs/ui"
import Hero from "@modules/home/components/hero"
import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

const VALUES = [
  ["Dal sacco al camion", "Ogni prodotto in più formati: sacco, bancale o camion completo su preventivo."],
  ["Consegna in tutta Italia", "Con i nostri camion o con corriere bancali, isole comprese. Oppure ritiro in sede."],
  ["Acconto per prenotare", "Paghi una parte all'ordine e il saldo prima della consegna o al ritiro."],
  ["Prezzi per aziende", "Registrati come azienda e vedi subito i tuoi prezzi IVA esclusa."],
]

export default async function Home(props: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await props.params
  const [region, categories] = await Promise.all([getRegion(countryCode), listCategories()])

  if (!region) {
    return null
  }

  const topCategories = (categories ?? []).filter((c) => !c.parent_category)
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
      <div className="content-container grid grid-cols-1 small:grid-cols-4 gap-6 py-12 border-b border-ui-border-base">
        {VALUES.map(([title, text]) => (
          <div key={title} className="flex flex-col gap-y-1">
            <Text className="txt-medium-plus text-ui-fg-base">{title}</Text>
            <Text className="txt-small text-ui-fg-subtle">{text}</Text>
          </div>
        ))}
      </div>
      {rails
        .filter((r) => r.products.length)
        .map(({ category, products }) => (
          <div key={category.id} className="content-container py-12 small:py-16">
            <div className="flex justify-between mb-8">
              <Text className="txt-xlarge">{category.name}</Text>
              <InteractiveLink href={`/categories/${category.handle}`}>Vedi tutti</InteractiveLink>
            </div>
            <ul className="grid grid-cols-2 small:grid-cols-3 gap-x-6 gap-y-12">
              {products.map((product) => (
                <li key={product.id}>
                  <ProductPreview product={product} region={region} isFeatured />
                </li>
              ))}
            </ul>
          </div>
        ))}
    </>
  )
}
