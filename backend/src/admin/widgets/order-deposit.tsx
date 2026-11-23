import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"
import { Badge, Container, Heading, Text } from "@medusajs/ui"
import { euro } from "../lib/sdk"

const PAY_STATUS: Record<string, { label: string; color: "orange" | "green" | "grey" }> = {
  pending: { label: "À encaisser", color: "orange" },
  paid: { label: "Encaissé", color: "green" },
}

/** Deposit (acompte) and balance (solde) of an order, plus invoice details. */
const OrderDepositWidget = ({ data: order }: DetailWidgetProps<AdminOrder>) => {
  const meta = (order.metadata ?? {}) as Record<string, any>
  const invoice = (meta.invoice ?? {}) as Record<string, any>
  const hasDeposit = meta.deposit_amount !== undefined

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Acompte et solde</Heading>
        <Badge size="2xsmall">
          {meta.customer_type === "business" ? "Entreprise" : "Particulier"}
        </Badge>
      </div>
      {hasDeposit ? (
        <div className="flex flex-col gap-y-2 px-6 py-4">
          {[
            [`Acompte (${meta.deposit_percent} %)`, meta.deposit_amount, meta.deposit_status],
            ["Solde avant livraison", meta.balance_amount, meta.balance_status],
          ].map(([label, amount, status]) => (
            <div key={label} className="flex items-center justify-between">
              <Text size="small">{label}</Text>
              <div className="flex items-center gap-x-2">
                <Text size="small" weight="plus">
                  {euro(amount)}
                </Text>
                <Badge size="2xsmall" color={PAY_STATUS[status]?.color ?? "grey"}>
                  {PAY_STATUS[status]?.label ?? status}
                </Badge>
              </div>
            </div>
          ))}
          <Text size="xsmall" className="text-ui-fg-subtle">
            L'encaissement réel de l'acompte et du solde sera branché avec le module de paiement.
          </Text>
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
