import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { AdminCustomer, DetailWidgetProps } from "@medusajs/framework/types"
import { Badge, Container, Heading, Text } from "@medusajs/ui"

/** Shows whether the customer signed up as a business and their invoice details. */
const CustomerBusinessWidget = ({ data: customer }: DetailWidgetProps<AdminCustomer>) => {
  const meta = (customer.metadata ?? {}) as Record<string, any>
  const business = meta.customer_type === "business"
  const rows = business
    ? [
        ["Société", customer.company_name],
        ["N° TVA", meta.vat_number],
        ["Code fiscal", meta.tax_code],
        ["Code SDI", meta.sdi_code],
        ["PEC", meta.pec],
      ]
    : [["Code fiscal", meta.tax_code]]

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Type de client</Heading>
        <Badge color={business ? "blue" : "grey"} size="2xsmall">
          {business ? "Entreprise (prix pro)" : "Particulier"}
        </Badge>
      </div>
      <div className="flex flex-col gap-y-1 px-6 py-4">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <Text size="small" className="text-ui-fg-subtle">
              {k}
            </Text>
            <Text size="small">{v || "—"}</Text>
          </div>
        ))}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.details.after",
})

export default CustomerBusinessWidget
