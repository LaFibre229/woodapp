import { getShopSettings } from "@lib/data/shop"
import { Heading, Text } from "@medusajs/ui"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Contatti" }

export default async function ContactPage() {
  const s = await getShopSettings()
  const rows: [string, string | null][] = [
    ["Telefono", s.phone],
    ["WhatsApp", s.whatsapp],
    ["Email", s.email],
    ["PEC", s.pec],
    ["Indirizzo", s.pickup_address],
    ["Orari", s.opening_hours],
  ]
  return (
    <div className="content-container py-12 flex flex-col gap-y-6 max-w-2xl">
      <Heading level="h1" className="text-3xl">
        Contatti
      </Heading>
      <Text className="text-ui-fg-subtle">
        Per ordini, consegne, preventivi o informazioni sulle stufe, contattaci.
      </Text>
      <dl className="grid grid-cols-3 gap-y-3 txt-medium">
        {rows
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-ui-fg-subtle">{k}</dt>
              <dd className="col-span-2 whitespace-pre-line">{v}</dd>
            </div>
          ))}
      </dl>
      {!rows.some(([, v]) => v) && (
        <Text className="text-ui-fg-muted">I contatti saranno disponibili a breve.</Text>
      )}
    </div>
  )
}
