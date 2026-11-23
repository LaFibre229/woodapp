import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types"
import { Button, Checkbox, Container, Heading, Input, Table, Text, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { sdk } from "../lib/sdk"

type Row = { id: string; title: string; pallets: string; quote_only: boolean; meta: any }

/**
 * Logistics of each format (variant): how much of a pallet one unit takes,
 * used to price delivery, and whether the format is sold on quote only.
 */
const ProductFormatsWidget = ({ data: product }: DetailWidgetProps<AdminProduct>) => {
  const [rows, setRows] = useState<Row[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setRows(
      (product.variants ?? []).map((v) => ({
        id: v.id,
        title: v.title ?? "",
        pallets: String((v.metadata as any)?.pallets ?? ""),
        quote_only: !!(v.metadata as any)?.quote_only,
        meta: v.metadata ?? {},
      }))
    )
  }, [product])

  const save = async () => {
    setSaving(true)
    try {
      for (const r of rows) {
        await sdk.admin.product.updateVariant(product.id, r.id, {
          metadata: {
            ...r.meta,
            pallets: r.pallets === "" ? null : Number(r.pallets.replace(",", ".")),
            quote_only: r.quote_only,
          },
        })
      }
      toast.success("Formats enregistrés")
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Formats et livraison</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Part de palette par unité (1 = une palette, 0,5 = demi-palette, 0,0143 = un sac sur
            70). Sert au calcul du prix de livraison.
          </Text>
        </div>
        <Button size="small" variant="secondary" onClick={save} isLoading={saving}>
          Enregistrer
        </Button>
      </div>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Format</Table.HeaderCell>
            <Table.HeaderCell>Palettes par unité</Table.HeaderCell>
            <Table.HeaderCell>Sur devis uniquement</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((r, i) => (
            <Table.Row key={r.id}>
              <Table.Cell>{r.title}</Table.Cell>
              <Table.Cell>
                <Input
                  size="small"
                  value={r.pallets}
                  onChange={(e) =>
                    setRows(rows.map((x, j) => (j === i ? { ...x, pallets: e.target.value } : x)))
                  }
                />
              </Table.Cell>
              <Table.Cell>
                <Checkbox
                  checked={r.quote_only}
                  onCheckedChange={(v) =>
                    setRows(rows.map((x, j) => (j === i ? { ...x, quote_only: !!v } : x)))
                  }
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductFormatsWidget
