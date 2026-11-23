"use client"

import { submitQuoteRequest } from "@lib/data/shop"
import { PROVINCES } from "@lib/util/italy"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { useActionState, useState } from "react"

/**
 * "Richiedi un preventivo": full trucks and large orders, quoted by the shop.
 * Requests appear in the admin under Demandes de devis.
 */
export default function QuoteRequestForm({
  product,
  variant,
  customer,
  compact = false,
}: {
  product?: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  customer?: HttpTypes.StoreCustomer | null
  compact?: boolean
}) {
  const [state, formAction] = useActionState(submitQuoteRequest, null)
  const meta = (customer?.metadata ?? {}) as Record<string, any>
  const [type, setType] = useState<"business" | "private">(
    meta.customer_type === "private" ? "private" : "business"
  )

  if (state?.ok) {
    return (
      <div
        className="rounded-rounded border border-ui-border-base bg-ui-bg-subtle p-4 text-small-regular"
        data-testid="quote-success"
      >
        <p className="font-semibold">Richiesta inviata, grazie!</p>
        <p className="text-ui-fg-subtle">
          Ti contatteremo entro un giorno lavorativo con il preventivo.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-y-2" data-testid="quote-form">
      {compact && (
        <p className="text-small-regular text-ui-fg-subtle">
          Compila il modulo: ti inviamo un preventivo con prezzo e data di consegna.
        </p>
      )}
      <input type="hidden" name="customer_type" value={type} />
      {product && <input type="hidden" name="product_id" value={product.id} />}
      {variant && <input type="hidden" name="variant_id" value={variant.id} />}
      {product && (
        <input
          type="hidden"
          name="product_title"
          value={`${product.title}${variant ? ` – ${variant.title}` : ""}`}
        />
      )}
      <div className="flex gap-2 text-small-regular" role="radiogroup">
        {(["business", "private"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={type === t}
            onClick={() => setType(t)}
            className={clx(
              "flex-1 h-9 border rounded-rounded",
              type === t ? "border-ui-border-interactive" : "border-ui-border-base"
            )}
          >
            {t === "business" ? "Azienda" : "Privato"}
          </button>
        ))}
      </div>
      {type === "business" && (
        <>
          <Input
            label="Ragione sociale"
            name="company_name"
            required
            defaultValue={customer?.company_name ?? ""}
          />
          <Input label="Partita IVA" name="vat_number" defaultValue={meta.vat_number ?? ""} />
        </>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Input label="Nome" name="first_name" required defaultValue={customer?.first_name ?? ""} />
        <Input label="Cognome" name="last_name" defaultValue={customer?.last_name ?? ""} />
      </div>
      <Input label="Email" name="email" type="email" required defaultValue={customer?.email ?? ""} />
      <Input label="Telefono" name="phone" type="tel" defaultValue={customer?.phone ?? ""} />
      <div className="grid grid-cols-2 gap-2">
        <Input label="CAP di consegna" name="postal_code" required inputMode="numeric" maxLength={5} />
        <Input label="Comune" name="city" />
      </div>
      <NativeSelect name="province" placeholder="Provincia" defaultValue="">
        {PROVINCES.map(([code, name]) => (
          <option key={code} value={code}>
            {name} ({code})
          </option>
        ))}
      </NativeSelect>
      {!product && <Input label="Prodotto" name="product_title" />}
      <Input
        label={compact ? "Quantità (es. 1 camion, 20 bancali)" : "Quantità"}
        name="quantity"
        required
      />
      <Input label="Data di consegna desiderata" name="desired_date" />
      <textarea
        name="message"
        rows={3}
        placeholder="Note (accesso camion, orari, ZTL…)"
        className="px-4 py-2 border rounded-md border-ui-border-base bg-ui-bg-field text-small-regular"
      />
      {state?.error && <p className="text-small-regular text-rose-500">{state.error}</p>}
      <SubmitButton className="w-full" data-testid="quote-submit">
        Richiedi un preventivo
      </SubmitButton>
    </form>
  )
}
