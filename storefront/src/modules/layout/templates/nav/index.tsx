import { Suspense } from "react"

import { getShopSettings } from "@lib/data/shop"
import { ShoppingBag, User } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Logo from "@modules/common/components/logo"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

const LINKS: [string, string][] = [
  ["Legna da ardere", "/categories/legna-da-ardere"],
  ["Pellet", "/categories/pellet"],
  ["Stufe", "/categories/stufe"],
  ["Preventivo camion", "/preventivo"],
  ["Consegne", "/consegne"],
]

export default async function Nav() {
  const settings = await getShopSettings()

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <div className="bg-bark-900 text-cream-100">
        <div className="content-container flex items-center justify-center gap-x-6 h-9 text-[12px] tracking-wide">
          <span>Consegna in tutta Italia, isole comprese</span>
          <span className="hidden small:inline text-cream-300/60">·</span>
          <span className="hidden small:inline">Paghi solo l&apos;acconto all&apos;ordine</span>
          <span className="hidden medium:inline text-cream-300/60">·</span>
          <LocalizedClientLink
            href="/account"
            className="hidden medium:inline underline-offset-4 hover:underline text-ember-300"
          >
            Prezzi riservati alle aziende
          </LocalizedClientLink>
        </div>
      </div>
      <header className="relative h-16 small:h-[72px] mx-auto border-b border-ui-border-base bg-cream-50/95 backdrop-blur supports-[backdrop-filter]:bg-cream-50/85">
        <nav className="content-container flex items-center justify-between w-full h-full text-[14px] text-bark-700">
          <div className="flex items-center gap-x-3 small:gap-x-10 h-full">
            <div className="h-full small:hidden">
              <SideMenu companyName={settings.company_name} />
            </div>
            <LocalizedClientLink
              href="/"
              aria-label={settings.company_name}
              data-testid="nav-store-link"
            >
              <Logo compact />
            </LocalizedClientLink>
            <div className="hidden small:flex items-center gap-x-7 h-full font-medium">
              {LINKS.map(([label, href]) => (
                <LocalizedClientLink
                  key={href}
                  className="hover:text-ember-600 transition-colors"
                  href={href}
                >
                  {label}
                </LocalizedClientLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-x-1 small:gap-x-2 h-full">
            <LocalizedClientLink
              className="hidden small:flex items-center gap-2 h-10 px-3 rounded-full hover:bg-bark-900/5 font-medium"
              href="/account"
              data-testid="nav-account-link"
            >
              <User />
              Account
            </LocalizedClientLink>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="flex items-center gap-2 h-10 px-3 rounded-full font-medium"
                  href="/cart"
                  data-testid="nav-cart-link"
                  aria-label="Carrello"
                >
                  <ShoppingBag />
                  <span className="hidden small:inline">Carrello</span>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
