import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Logo from "@modules/common/components/logo"
import ChevronDown from "@modules/common/icons/chevron-down"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-ui-bg-base relative small:min-h-screen">
      <div className="h-16 small:h-[72px] bg-cream-50 border-b border-ui-border-base">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="text-small-semi text-ui-fg-base flex items-center gap-x-2 flex-1 basis-0"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="mt-px hidden small:block txt-compact-plus text-ui-fg-subtle hover:text-ember-600">
              Torna al carrello
            </span>
            <span className="mt-px block small:hidden txt-compact-plus text-ui-fg-subtle hover:text-ember-600">
              Indietro
            </span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            aria-label="Tempio del Riscaldamento"
            data-testid="store-link"
          >
            <Logo compact />
          </LocalizedClientLink>
          <div className="flex-1 basis-0 flex justify-end">
            <span className="hidden small:inline text-[12px] text-ui-fg-muted">
              Pagamento sicuro
            </span>
          </div>
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">{children}</div>
    </div>
  )
}
