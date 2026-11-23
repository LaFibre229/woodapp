import { getShopSettings } from "@lib/data/shop"
import { Heading, Text } from "@medusajs/ui"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Informativa sulla privacy" }

// Placeholder: the final text is written with the accountant and published in
// the deployment layer, once the company exists.
export default async function LegalPage() {
  const s = await getShopSettings()
  return (
    <div className="content-container py-12 flex flex-col gap-y-4 max-w-2xl">
      <Heading level="h1" className="text-3xl">
        Informativa sulla privacy
      </Heading>
      <Text className="text-ui-fg-subtle">
        Testo in preparazione. Titolare: {s.company_name}
        {s.vat_number ? `, P.IVA ${s.vat_number}` : ""}.
      </Text>
    </div>
  )
}
