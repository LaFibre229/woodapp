import { listCategories } from "@lib/data/categories"
import { getShopSettings } from "@lib/data/shop"
import { sortCategories } from "@lib/util/category-display"
import { Text } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Logo from "@modules/common/components/logo"

/**
 * Footer with the legal details Italian law requires on a shop site (company
 * name, VAT number, REA, PEC, registered address). They come from the admin
 * settings, so they show up as soon as the company exists.
 */
export default async function Footer() {
  const [settings, productCategories] = await Promise.all([
    getShopSettings(),
    listCategories(),
  ])

  const address = [
    settings.address_line,
    [settings.postal_code, settings.city].filter(Boolean).join(" "),
    settings.province && `(${settings.province})`,
  ]
    .filter(Boolean)
    .join(", ")

  const legal = [
    [settings.company_name, settings.legal_form].filter(Boolean).join(" "),
    address && `Sede: ${address}`,
    settings.vat_number && `P.IVA ${settings.vat_number}`,
    settings.tax_code && settings.tax_code !== settings.vat_number && `C.F. ${settings.tax_code}`,
    settings.rea_number && `REA ${settings.rea_number}`,
    settings.share_capital && `Capitale sociale ${settings.share_capital}`,
    settings.pec && `PEC ${settings.pec}`,
  ].filter(Boolean)

  return (
    <footer className="w-full bg-bark-900 text-cream-200">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-12 small:flex-row items-start justify-between pt-16 pb-12 small:pt-20">
          <div className="flex flex-col gap-y-3 max-w-xs">
            <LocalizedClientLink href="/" aria-label={settings.company_name}>
              <Logo tone="light" />
            </LocalizedClientLink>
            <Text className="txt-small text-cream-300 mt-2">
              Legna da ardere, pellet e stufe con consegna in tutta Italia, per famiglie e
              aziende.
            </Text>
          </div>
          <div className="text-small-regular gap-10 small:gap-x-16 grid grid-cols-2 small:grid-cols-3 w-full small:w-auto">
            {productCategories && productCategories.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="eyebrow !text-ember-300">Prodotti</span>
                <ul className="grid grid-cols-1 gap-2 text-cream-200 txt-small" data-testid="footer-categories">
                  {sortCategories(productCategories.filter((c) => !c.parent_category))
                    .slice(0, 6)
                    .map((c) => (
                      <li key={c.id}>
                        <LocalizedClientLink
                          className="hover:text-ember-300"
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                      </li>
                    ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <span className="eyebrow !text-ember-300">Servizi</span>
              <ul className="grid grid-cols-1 gap-2 text-cream-200 txt-small">
                <li>
                  <LocalizedClientLink className="hover:text-ember-300" href="/consegne">
                    Zone di consegna
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className="hover:text-ember-300" href="/preventivo">
                    Preventivo camion e aziende
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className="hover:text-ember-300" href="/account">
                    Area clienti
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-y-2">
              <span className="eyebrow !text-ember-300">Contatti</span>
              <ul className="grid grid-cols-1 gap-2 text-cream-200 txt-small">
                {settings.phone && (
                  <li>
                    <a className="hover:text-ember-300" href={`tel:${settings.phone.replace(/\s/g, "")}`}>
                      {settings.phone}
                    </a>
                  </li>
                )}
                {settings.email && (
                  <li>
                    <a className="hover:text-ember-300" href={`mailto:${settings.email}`}>
                      {settings.email}
                    </a>
                  </li>
                )}
                {settings.opening_hours && <li className="whitespace-pre-line">{settings.opening_hours}</li>}
                <li>
                  <LocalizedClientLink className="hover:text-ember-300" href="/contatti">
                    Tutti i contatti
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-y-1 w-full py-8 border-t border-cream-50/10 text-cream-300/70">
          <Text className="txt-compact-small" data-testid="footer-legal">
            © {new Date().getFullYear()} {legal.join(" · ")}
          </Text>
        </div>
      </div>
    </footer>
  )
}
