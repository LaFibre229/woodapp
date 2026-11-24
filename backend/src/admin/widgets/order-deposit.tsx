import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"
import { Badge, Button, Container, Heading, Input, Text, toast } from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"
import { euro, sdk } from "../lib/sdk"

type Part = {
  amount: number
  state: "none" | "awaiting" | "authorized" | "paid" | "canceled"
  provider_id: string | null
}
type Payments = { deposit: Part; balance: Part; pay_url: string | null }

const STATE: Record<string, { label: string; color: "orange" | "green" | "grey" | "blue" | "red" }> = {
  none: { label: "Pas encore demandé", color: "grey" },
  awaiting: { label: "En attente", color: "orange" },
  authorized: { label: "Virement attendu", color: "blue" },
  paid: { label: "Encaissé", color: "green" },
  canceled: { label: "Annulé", color: "red" },
}

const PROVIDER: Record<string, string> = {
  pp_stripe_stripe: "Stripe (carte, PayPal…)",
  pp_bonifico_bonifico: "Virement",
  pp_system_default: "Manuel / test",
}

/** Deposit (acompte) and balance (solde) of an order, plus invoice details. */
const OrderDepositWidget = ({ data: order }: DetailWidgetProps<AdminOrder>) => {
  const meta = (order.metadata ?? {}) as Record<string, any>
  const invoice = (meta.invoice ?? {}) as Record<string, any>
  const hasDeposit = meta.deposit_amount !== undefined
  const [payments, setPayments] = useState<Payments | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(() => {
    sdk.client
      .fetch<Payments>(`/admin/order-payments/${order.id}`)
      .then(setPayments)
      .catch(() => setPayments(null))
  }, [order.id])
  useEffect(load, [load])

  const run = async (key: string, path: string, body?: Record<string, unknown>, done?: string) => {
    setBusy(key)
    try {
      const res = await sdk.client.fetch<Payments>(`/admin/order-payments/${order.id}${path}`, {
        method: "POST",
        body: body ?? {},
      })
      setPayments(res)
      if (done) toast.success(done)
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur")
    } finally {
      setBusy(null)
    }
  }

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Lien copié")
    } catch {
      toast.error("Copie impossible, sélectionnez le lien à la main")
    }
  }

  const rows: [string, "deposit" | "balance", Part | undefined, unknown][] = [
    [`Acompte (${meta.deposit_percent} %)`, "deposit", payments?.deposit, meta.deposit_amount],
    ["Solde avant livraison", "balance", payments?.balance, meta.balance_amount],
  ]

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Acompte et solde</Heading>
        <Badge size="2xsmall">
          {meta.customer_type === "business" ? "Entreprise" : "Particulier"}
        </Badge>
      </div>
      {hasDeposit ? (
        <div className="flex flex-col gap-y-3 px-6 py-4">
          {rows.map(([label, key, part, fallback]) => (
            <div key={key} className="flex flex-col gap-y-1">
              <div className="flex items-center justify-between">
                <Text size="small">{label}</Text>
                <div className="flex items-center gap-x-2">
                  <Text size="small" weight="plus">
                    {euro(part?.amount ?? fallback)}
                  </Text>
                  {part && (
                    <Badge size="2xsmall" color={STATE[part.state]?.color ?? "grey"}>
                      {STATE[part.state]?.label ?? part.state}
                    </Badge>
                  )}
                </div>
              </div>
              {part?.provider_id && (
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {PROVIDER[part.provider_id] ?? part.provider_id}
                </Text>
              )}
              {part && part.amount > 0 && part.state !== "paid" && (key === "deposit" || part.state !== "none") && (
                <div>
                  <Button
                    size="small"
                    variant="secondary"
                    isLoading={busy === `paid-${key}`}
                    onClick={() =>
                      run(`paid-${key}`, "/mark-paid", { part: key }, "Paiement enregistré")
                    }
                  >
                    Marquer comme reçu (virement, espèces)
                  </Button>
                </div>
              )}
            </div>
          ))}

          {payments && payments.balance.amount > 0 && payments.balance.state !== "paid" && (
            <div className="flex flex-col gap-y-2 rounded-md border border-ui-border-base p-3">
              {payments.pay_url ? (
                <>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    Lien de paiement du solde à envoyer au client (carte, PayPal ou virement) :
                  </Text>
                  <div className="flex gap-x-2">
                    <Input size="small" readOnly value={payments.pay_url} onFocus={(e) => e.target.select()} />
                    <Button size="small" variant="secondary" onClick={() => copy(payments.pay_url!)}>
                      Copier
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    Avant la livraison, demandez le solde : un lien de paiement est créé pour le client.
                  </Text>
                  <div>
                    <Button
                      size="small"
                      isLoading={busy === "request"}
                      onClick={() => run("request", "/request-balance", {}, "Lien de paiement créé")}
                    >
                      Demander le solde
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
          <div>
            <Button size="small" variant="transparent" onClick={load}>
              Actualiser
            </Button>
          </div>
        </div>
      ) : (
        <Text size="small" className="px-6 py-4 text-ui-fg-subtle">
          Pas d'acompte enregistré pour cette commande.
        </Text>
      )}
      <div className="flex flex-col gap-y-1 px-6 py-4">
        <Text size="small" weight="plus">
          Facturation
        </Text>
        {[
          ["Code fiscal", invoice.tax_code],
          ["Société", invoice.company_name],
          ["N° TVA", invoice.vat_number],
          ["Code SDI", invoice.sdi_code],
          ["PEC", invoice.pec],
        ]
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <Text size="small" className="text-ui-fg-subtle">
                {k}
              </Text>
              <Text size="small">{v}</Text>
            </div>
          ))}
        {!Object.values(invoice).some(Boolean) && (
          <Text size="small" className="text-ui-fg-subtle">
            Aucune donnée de facturation.
          </Text>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.before",
})

export default OrderDepositWidget
