import { confirmBalancePayment, getBalance } from "@lib/data/shop"
import { convertToLocale } from "@lib/util/money"
import { Heading, Text } from "@medusajs/ui"
import BalancePayment from "@modules/shop/components/balance-payment"
import BankTransferDetails from "@modules/shop/components/bank-transfer"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Paga il saldo",
  robots: { index: false },
}

type Props = {
  params: Promise<{ countryCode: string; orderId: string }>
  searchParams: Promise<{ t?: string; redirect_status?: string }>
}

/**
 * Balance (saldo) payment page, opened from the link the shop sends before
 * delivery. The token in the link stands in for a login.
 */
export default async function BalancePage({ params, searchParams }: Props) {
  const { orderId } = await params
  const { t = "", redirect_status } = await searchParams

  let info = await getBalance(orderId, t)

  // Back from a redirect payment method (PayPal...): record the payment
  if (info && redirect_status === "succeeded" && info.balance.state === "awaiting") {
    await confirmBalancePayment(orderId, t)
    info = await getBalance(orderId, t)
  }

  if (!info) {
    return (
      <div className="content-container py-12 flex flex-col gap-y-4 max-w-2xl">
        <Heading level="h1" className="text-3xl">
          Link non valido
        </Heading>
        <Text className="text-ui-fg-subtle">
          Questo link di pagamento non è valido o è scaduto. Contattaci e te ne inviamo uno nuovo.
        </Text>
      </div>
    )
  }

  const { order, balance } = info
  const fmt = (amount: number) =>
    convertToLocale({ amount, currency_code: order.currency_code })
  const stripeAvailable =
    !!process.env.NEXT_PUBLIC_STRIPE_KEY && info.providers.includes("pp_stripe_stripe")

  return (
    <div className="content-container py-12 flex flex-col gap-y-6 max-w-2xl">
      <Heading level="h1" className="text-3xl">
        Saldo dell&apos;ordine n. {order.display_id}
      </Heading>
      <div className="flex flex-col gap-y-2 rounded-rounded border border-ui-border-base bg-ui-bg-subtle p-4 txt-medium">
        <div className="flex justify-between">
          <span className="text-ui-fg-subtle">Totale ordine</span>
          <span>{fmt(order.total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ui-fg-subtle">Acconto</span>
          <span>
            {fmt(info.deposit.amount)}
            {info.deposit.state === "paid" ? " (pagato)" : ""}
          </span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Saldo</span>
          <span data-testid="balance-amount">{fmt(balance.amount)}</span>
        </div>
      </div>

      {balance.state === "paid" ? (
        <Text className="txt-medium-plus text-ui-fg-base" data-testid="balance-paid">
          Saldo pagato, grazie! Ti contatteremo per la consegna o il ritiro.
        </Text>
      ) : balance.state === "authorized" ? (
        <Text className="txt-medium text-ui-fg-subtle">
          Pagamento ricevuto, in verifica. Non serve fare altro.
        </Text>
      ) : balance.state === "awaiting" ? (
        <>
          {stripeAvailable && (
            <BalancePayment
              orderId={order.id}
              token={t}
              amountLabel={fmt(balance.amount)}
              clientSecret={
                info.session?.provider_id === "pp_stripe_stripe"
                  ? info.session.client_secret
                  : null
              }
            />
          )}
          {info.bank_transfer && (
            <BankTransferDetails
              bank={info.bank_transfer}
              amount={balance.amount}
              currencyCode={order.currency_code}
              reference={`Saldo ordine n. ${order.display_id}`}
              title={stripeAvailable ? "Oppure paga con bonifico" : "Paga con bonifico"}
            />
          )}
          {!stripeAvailable && !info.bank_transfer && (
            <Text className="text-ui-fg-subtle">
              Contattaci per concordare il pagamento del saldo.
            </Text>
          )}
        </>
      ) : (
        <Text className="text-ui-fg-subtle">Non c&apos;è un saldo da pagare per questo ordine.</Text>
      )}
    </div>
  )
}
