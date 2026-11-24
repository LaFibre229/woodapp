import { getShopSettings, listDeliveryZones } from "@lib/data/shop"
import { CARRIER_LABELS, formatEuro } from "@lib/util/italy"
import { Heading, Text } from "@medusajs/ui"
import DeliveryCheck from "@modules/shop/components/delivery-check"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Zone di consegna",
  description: "Dove consegniamo legna, pellet e stufe, con costi e tempi per zona.",
}

export default async function DeliveryZonesPage() {
  const [zones, settings] = await Promise.all([listDeliveryZones(), getShopSettings()])
  return (
    <div className="content-container py-12 flex flex-col gap-y-8">
      <div className="flex flex-col gap-y-2 max-w-2xl">
        <Heading level="h1" className="text-[34px] small:text-[44px] leading-tight text-bark-900">
          Zone di consegna
        </Heading>
        <Text className="text-ui-fg-subtle">
          Consegniamo in tutta Italia, isole comprese. Il costo dipende dalla zona e dal numero
          di bancali: sotto un bancale si paga una tariffa fissa, poi un prezzo per ogni bancale.
        </Text>
      </div>
      <div className="max-w-sm">
        <DeliveryCheck />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left txt-medium">
          <thead className="text-ui-fg-subtle border-b border-ui-border-base">
            <tr>
              <th className="py-2 pr-4">Zona</th>
              <th className="py-2 pr-4">Consegna con</th>
              <th className="py-2 pr-4">Meno di un bancale</th>
              <th className="py-2 pr-4">Per bancale</th>
              <th className="py-2 pr-4">Ordine minimo</th>
              <th className="py-2">Tempi</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => (
              <tr key={z.id} className="border-b border-ui-border-base">
                <td className="py-2 pr-4">{z.name}</td>
                <td className="py-2 pr-4">{CARRIER_LABELS[z.carrier]}</td>
                <td className="py-2 pr-4">{formatEuro(z.small_order_price)}</td>
                <td className="py-2 pr-4">{formatEuro(z.price_per_pallet)}</td>
                <td className="py-2 pr-4">
                  {z.min_order_amount > 0 ? formatEuro(z.min_order_amount) : "Nessuno"}
                </td>
                <td className="py-2">{z.lead_time ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Text className="txt-small text-ui-fg-muted mt-2">Prezzi IVA inclusa.</Text>
      </div>
      {settings.pickup_enabled && (
        <div className="flex flex-col gap-y-1">
          <Heading level="h2" className="text-xl">
            Ritiro in sede gratuito
          </Heading>
          <Text className="text-ui-fg-subtle">
            {settings.pickup_address ?? "Indirizzo in arrivo."}
            {settings.opening_hours ? ` · ${settings.opening_hours}` : ""}
          </Text>
          {settings.pickup_notes && <Text className="text-ui-fg-subtle">{settings.pickup_notes}</Text>}
        </div>
      )}
    </div>
  )
}
