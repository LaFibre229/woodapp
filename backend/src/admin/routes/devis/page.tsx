import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Drawer,
  Heading,
  Label,
  Select,
  Table,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useEffect, useState } from "react"
import { sdk } from "../../lib/sdk"

type Quote = Record<string, any> & { id: string; status: keyof typeof STATUS }

const STATUS = {
  new: { label: "Nouvelle", color: "blue" },
  contacted: { label: "Client contacté", color: "orange" },
  quoted: { label: "Devis envoyé", color: "purple" },
  won: { label: "Gagnée", color: "green" },
  lost: { label: "Perdue", color: "grey" },
} as const

const QuoteRequestsPage = () => {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [open, setOpen] = useState<Quote | null>(null)

  const load = () =>
    sdk.client
      .fetch<{ quote_requests: Quote[] }>("/admin/quote-requests", {
        query: filter === "all" ? { limit: 100 } : { status: filter, limit: 100 },
      })
      .then(({ quote_requests }) => setQuotes(quote_requests))
      .catch(() => toast.error("Impossible de charger les demandes"))

  useEffect(() => {
    load()
  }, [filter])

  const save = async () => {
    if (!open) return
    try {
      await sdk.client.fetch(`/admin/quote-requests/${open.id}`, {
        method: "POST",
        body: { status: open.status, admin_notes: open.admin_notes || null },
      })
      toast.success("Demande mise à jour")
      setOpen(null)
      load()
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur")
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Demandes de devis</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Commandes par camion complet et grosses quantités envoyées depuis la boutique.
          </Text>
        </div>
        <div className="w-48">
          <Select value={filter} onValueChange={setFilter}>
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">Toutes</Select.Item>
              {Object.entries(STATUS).map(([k, v]) => (
                <Select.Item key={k} value={k}>
                  {v.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
      </div>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Date</Table.HeaderCell>
            <Table.HeaderCell>Client</Table.HeaderCell>
            <Table.HeaderCell>Produit</Table.HeaderCell>
            <Table.HeaderCell>Quantité</Table.HeaderCell>
            <Table.HeaderCell>CAP</Table.HeaderCell>
            <Table.HeaderCell>Statut</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {quotes.length === 0 && (
            <Table.Row>
              <Table.Cell {...({ colSpan: 6 } as any)}>
                <Text className="text-ui-fg-subtle">Aucune demande pour le moment.</Text>
              </Table.Cell>
            </Table.Row>
          )}
          {quotes.map((q) => (
            <Table.Row key={q.id} className="cursor-pointer" onClick={() => setOpen({ ...q })}>
              <Table.Cell>{new Date(q.created_at).toLocaleDateString("fr-FR")}</Table.Cell>
              <Table.Cell>
                {q.company_name || [q.first_name, q.last_name].filter(Boolean).join(" ")}
                {q.customer_type === "business" && (
                  <Badge size="2xsmall" className="ml-2">
                    Entreprise
                  </Badge>
                )}
              </Table.Cell>
              <Table.Cell>{q.product_title ?? "—"}</Table.Cell>
              <Table.Cell>{q.quantity ?? "—"}</Table.Cell>
              <Table.Cell>{q.postal_code}</Table.Cell>
              <Table.Cell>
                <Badge color={STATUS[q.status]?.color ?? "grey"} size="2xsmall">
                  {STATUS[q.status]?.label ?? q.status}
                </Badge>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <Drawer open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Demande de devis</Drawer.Title>
          </Drawer.Header>
          {open && (
            <Drawer.Body className="flex flex-col gap-y-4 overflow-y-auto">
              <dl className="grid grid-cols-3 gap-2 text-sm">
                {[
                  ["Type", open.customer_type === "business" ? "Entreprise" : "Particulier"],
                  ["Société", open.company_name],
                  ["N° TVA", open.vat_number],
                  ["Nom", [open.first_name, open.last_name].filter(Boolean).join(" ")],
                  ["E-mail", open.email],
                  ["Téléphone", open.phone],
                  ["Livraison", [open.postal_code, open.city, open.province].filter(Boolean).join(" ")],
                  ["Produit", open.product_title],
                  ["Quantité", open.quantity],
                  ["Date souhaitée", open.desired_date],
                  ["Message", open.message],
                ].map(([k, v]) => (
                  <div key={k as string} className="contents">
                    <dt className="text-ui-fg-subtle">{k}</dt>
                    <dd className="col-span-2 whitespace-pre-wrap">{v || "—"}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-col gap-y-1">
                <Label>Statut</Label>
                <Select
                  value={open.status}
                  onValueChange={(v) => setOpen({ ...open, status: v as Quote["status"] })}
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {Object.entries(STATUS).map(([k, v]) => (
                      <Select.Item key={k} value={k}>
                        {v.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
              <div className="flex flex-col gap-y-1">
                <Label>Notes internes</Label>
                <Textarea
                  value={open.admin_notes ?? ""}
                  onChange={(e) => setOpen({ ...open, admin_notes: e.target.value })}
                />
              </div>
            </Drawer.Body>
          )}
          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button variant="secondary">Fermer</Button>
            </Drawer.Close>
            <Button onClick={save}>Enregistrer</Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Demandes de devis",
  icon: DocumentText,
})

export default QuoteRequestsPage
