import { retrieveCustomer } from "@lib/data/customer"
import { Heading, Text } from "@medusajs/ui"
import QuoteRequestForm from "@modules/shop/components/quote-request-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Preventivo camion e grandi ordini",
  description: "Richiedi un preventivo per un camion completo di legna o pellet, o per ordini aziendali.",
}

export default async function QuotePage() {
  const customer = await retrieveCustomer()
  return (
    <div className="content-container py-12 grid grid-cols-1 small:grid-cols-2 gap-12">
      <div className="flex flex-col gap-y-4">
        <Heading level="h1" className="text-3xl">
          Preventivo per camion completo e grandi quantità
        </Heading>
        <Text className="text-ui-fg-subtle">
          Per un camion completo di legna o pellet, per più bancali o per forniture
          stagionali, ti prepariamo un preventivo su misura con prezzo e data di consegna.
        </Text>
        <ul className="list-disc pl-5 text-ui-fg-subtle txt-medium flex flex-col gap-y-1">
          <li>Pizzerie, panifici, hotel, agriturismi e rivenditori</li>
          <li>Prezzi a scaglioni per numero di bancali</li>
          <li>Contratti stagionali a prezzo fisso e ordini ricorrenti</li>
          <li>Risposta entro un giorno lavorativo</li>
        </ul>
      </div>
      <div>
        <QuoteRequestForm customer={customer} />
      </div>
    </div>
  )
}
