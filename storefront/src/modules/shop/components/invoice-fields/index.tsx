"use client"

import { HttpTypes } from "@medusajs/types"
import { Heading, Text, clx } from "@medusajs/ui"
import Input from "@modules/common/components/input"
import { useState } from "react"

/**
 * Invoice details required for Italian electronic invoices (fattura
 * elettronica): tax code for households; company name, VAT number and SDI code
 * or PEC for businesses. Saved on the cart, then on the order.
 */
export default function InvoiceFields({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  const cartMeta = (cart?.metadata ?? {}) as Record<string, any>
  const invoice = (cartMeta.invoice ?? {}) as Record<string, string>
  const customerMeta = (customer?.metadata ?? {}) as Record<string, any>
  const [type, setType] = useState<"private" | "business">(
    cartMeta.customer_type ?? customerMeta.customer_type ?? "private"
  )
  const fromAccount = (key: string) => invoice[key] ?? customerMeta[key] ?? ""

  return (
    <div className="flex flex-col gap-y-4 pt-8" data-testid="invoice-fields">
      <Heading level="h2" className="text-3xl-regular">
        Dati per la fattura
      </Heading>
      <input type="hidden" name="customer_type" value={type} />
      <div className="flex gap-2 text-small-regular max-w-sm" role="radiogroup">
        {(["private", "business"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={type === t}
            onClick={() => setType(t)}
            className={clx(
              "flex-1 h-10 border rounded-rounded",
              type === t ? "border-ui-border-interactive" : "border-ui-border-base"
            )}
          >
            {t === "private" ? "Privato" : "Azienda / P.IVA"}
          </button>
        ))}
      </div>
      {type === "private" ? (
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Codice fiscale"
            name="invoice.tax_code"
            required
            defaultValue={fromAccount("tax_code")}
            maxLength={16}
            data-testid="invoice-tax-code-input"
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ragione sociale"
              name="invoice.company_name"
              required
              defaultValue={invoice.company_name ?? customer?.company_name ?? ""}
              data-testid="invoice-company-input"
            />
            <Input
              label="Partita IVA"
              name="invoice.vat_number"
              required
              defaultValue={fromAccount("vat_number")}
              data-testid="invoice-vat-input"
            />
            <Input
              label="Codice fiscale (se diverso)"
              name="invoice.tax_code"
              defaultValue={fromAccount("tax_code")}
            />
            <Input
              label="Codice SDI"
              name="invoice.sdi_code"
              maxLength={7}
              defaultValue={fromAccount("sdi_code")}
              data-testid="invoice-sdi-input"
            />
            <Input label="PEC" name="invoice.pec" type="email" defaultValue={fromAccount("pec")} />
          </div>
          <Text className="txt-small text-ui-fg-subtle">
            Indica il codice SDI oppure la PEC per ricevere la fattura elettronica.
          </Text>
        </>
      )}
    </div>
  )
}
