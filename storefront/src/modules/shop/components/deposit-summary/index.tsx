import { convertToLocale } from "@lib/util/money"
import { Text } from "@medusajs/ui"

export type DepositInfo = {
  percent: number
  deposit_amount: number
  balance_amount: number
}

/** Deposit (acconto) due now and balance (saldo) due before delivery or at pickup. */
export default function DepositSummary({
  deposit,
  currencyCode = "eur",
  title = "Pagamento",
  paid = false,
}: {
  deposit: DepositInfo
  currencyCode?: string
  title?: string
  paid?: boolean
}) {
  const fmt = (amount: number) => convertToLocale({ amount, currency_code: currencyCode })
  return (
    <div
      className="flex flex-col gap-y-2 rounded-rounded border border-ui-border-base bg-ui-bg-subtle p-4 txt-medium"
      data-testid="deposit-summary"
    >
      <Text className="txt-medium-plus text-ui-fg-base">{title}</Text>
      <div className="flex items-center justify-between">
        <span>
          {paid ? "Acconto" : "Acconto da pagare ora"} ({deposit.percent}%)
        </span>
        <span className="font-semibold" data-testid="deposit-amount">
          {fmt(deposit.deposit_amount)}
        </span>
      </div>
      {deposit.balance_amount > 0 && (
        <div className="flex items-center justify-between text-ui-fg-subtle">
          <span>Saldo prima della consegna o al ritiro</span>
          <span data-testid="balance-amount">{fmt(deposit.balance_amount)}</span>
        </div>
      )}
      <Text className="txt-small text-ui-fg-muted">
        L&apos;acconto conferma e prenota il tuo ordine. Il saldo si paga con carta o bonifico
        prima della consegna, oppure al momento del ritiro.
      </Text>
    </div>
  )
}
