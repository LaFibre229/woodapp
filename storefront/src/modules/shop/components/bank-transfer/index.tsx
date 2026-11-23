import type { BankTransfer } from "@lib/data/shop"
import { convertToLocale } from "@lib/util/money"
import { Text } from "@medusajs/ui"

/** IBAN, beneficiary and reference (causale) for paying by bonifico. */
export default function BankTransferDetails({
  bank,
  amount,
  currencyCode = "eur",
  reference,
  title = "Dati per il bonifico",
}: {
  bank: BankTransfer
  amount: number
  currencyCode?: string
  reference: string
  title?: string
}) {
  const rows: [string, string | null][] = [
    ["Importo", convertToLocale({ amount, currency_code: currencyCode })],
    ["Beneficiario", bank.beneficiary],
    ["IBAN", bank.iban.replace(/(.{4})/g, "$1 ").trim()],
    ["BIC / SWIFT", bank.bic],
    ["Banca", bank.bank_name],
    ["Causale", reference],
  ]
  return (
    <div
      className="flex flex-col gap-y-2 rounded-rounded border border-ui-border-base bg-ui-bg-subtle p-4 txt-medium"
      data-testid="bank-transfer-details"
    >
      <Text className="txt-medium-plus text-ui-fg-base">{title}</Text>
      {rows
        .filter(([, v]) => v)
        .map(([label, value]) => (
          <div key={label} className="flex flex-col small:flex-row small:justify-between gap-x-4">
            <span className="text-ui-fg-subtle">{label}</span>
            <span className="font-semibold break-all small:text-right">{value}</span>
          </div>
        ))}
      <Text className="txt-small text-ui-fg-muted">
        Indica la causale esatta così possiamo collegare il pagamento al tuo ordine.
        Ti confermiamo il pagamento appena riceviamo l&apos;accredito (di solito 1-2 giorni lavorativi).
      </Text>
    </div>
  )
}
