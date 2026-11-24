import { TruckFast } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductArt from "@modules/products/components/product-art"

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-bark-900 text-cream-50">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_60%,rgba(226,118,63,0.35),transparent_55%),radial-gradient(ellipse_at_10%_0%,rgba(138,106,80,0.35),transparent_50%)]"
      />
      <div className="content-container relative grid grid-cols-1 small:grid-cols-[1.1fr_1fr] items-center gap-10 small:gap-16 pt-10 pb-14 small:py-24">
        <div className="flex flex-col gap-6 max-w-xl">
          <span className="eyebrow !text-ember-300">Legna · Pellet · Stufe</span>
          <h1 className="font-display text-[40px] leading-[1.05] small:text-[64px] font-medium">
            Il calore giusto, consegnato a casa tua.
          </h1>
          <p className="text-[17px] small:text-lg leading-relaxed text-cream-200 max-w-lg">
            Legna stagionata, pellet certificato e stufe, dal sacco al camion
            completo, in tutta Italia. Prezzi riservati per pizzerie, panifici,
            hotel e rivenditori.
          </p>
          <div className="grid grid-cols-2 xsmall:flex xsmall:flex-row gap-3 pt-2">
            <LocalizedClientLink href="/categories/legna-da-ardere" className="btn-ember col-span-2">
              Scopri la legna
            </LocalizedClientLink>
            <LocalizedClientLink href="/categories/pellet" className="btn-outline-light">
              Pellet
            </LocalizedClientLink>
            <LocalizedClientLink href="/preventivo" className="btn-outline-light">
              Preventivo camion
            </LocalizedClientLink>
          </div>
          <dl className="grid grid-cols-3 gap-4 pt-6 border-t border-cream-50/10 mt-2 max-w-md">
            {[
              ["<20%", "umidità legna"],
              ["A1", "pellet ENplus"],
              ["50%", "acconto all'ordine"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-2xl text-ember-300">{value}</dt>
                <dd className="text-[12px] text-cream-300 leading-tight mt-1">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-[460px] small:max-w-none">
          <div className="relative aspect-[4/3] small:aspect-[4/5] rounded-[28px] overflow-hidden ring-1 ring-cream-50/10 shadow-2xl">
            <ProductArt kind="stove" />
          </div>
          <div className="absolute -left-2 small:-left-8 -bottom-4 small:bottom-10 w-28 small:w-48 aspect-square rounded-[22px] overflow-hidden ring-4 ring-bark-900 shadow-xl">
            <ProductArt kind="wood" />
          </div>
          <div className="absolute right-3 small:-right-6 top-4 small:top-8 flex items-center gap-2 rounded-full bg-cream-50 text-bark-900 px-4 py-2 text-[13px] font-medium shadow-lg">
            <TruckFast className="text-ember-600" /> Consegna in tutta Italia
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
