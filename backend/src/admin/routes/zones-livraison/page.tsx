import { defineRouteConfig } from "@medusajs/admin-sdk"
import { MapPin } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Drawer,
  Heading,
  Input,
  Label,
  Select,
  Switch,
  Table,
  Text,
  Textarea,
  toast,
  usePrompt,
} from "@medusajs/ui"
import { useEffect, useState } from "react"
import { euro, num, sdk } from "../../lib/sdk"

type Zone = {
  id?: string
  name: string
  description?: string | null
  active: boolean
  cap_rules: string[] | string
  provinces: string[] | string
  carrier: "own_truck" | "pallet_carrier" | "courier"
  small_order_price: number | string
  price_per_pallet: number | string
  min_order_amount: number | string
  lead_time?: string | null
  priority: number | string
}

const CARRIERS: Record<Zone["carrier"], string> = {
  own_truck: "Nos camions",
  pallet_carrier: "Transporteur palettes",
  courier: "Coursier",
}

const empty: Zone = {
  name: "",
  description: "",
  active: true,
  cap_rules: [],
  provinces: [],
  carrier: "pallet_carrier",
  small_order_price: 0,
  price_per_pallet: 0,
  min_order_amount: 0,
  lead_time: "",
  priority: 0,
}

const list = (v: string[] | string | null | undefined) =>
  Array.isArray(v) ? v.join(", ") : v ?? ""

const DeliveryZonesPage = () => {
  const [zones, setZones] = useState<Zone[]>([])
  const [editing, setEditing] = useState<Zone | null>(null)
  const [saving, setSaving] = useState(false)
  const [testCap, setTestCap] = useState("")
  const [testResult, setTestResult] = useState<string | null>(null)
  const prompt = usePrompt()

  const load = () =>
    sdk.client
      .fetch<{ delivery_zones: Zone[] }>("/admin/delivery-zones")
      .then(({ delivery_zones }) => setZones(delivery_zones))
      .catch(() => toast.error("Impossible de charger les zones"))

  useEffect(() => {
    load()
  }, [])

  const save = async () => {
    if (!editing) return
    setSaving(true)
    const { id, ...rest } = editing
    const body = {
      name: rest.name,
      description: rest.description || null,
      active: rest.active,
      cap_rules: list(rest.cap_rules),
      provinces: list(rest.provinces).toUpperCase(),
      carrier: rest.carrier,
      small_order_price: num(rest.small_order_price),
      price_per_pallet: num(rest.price_per_pallet),
      min_order_amount: num(rest.min_order_amount),
      lead_time: rest.lead_time || null,
      priority: Number(rest.priority) || 0,
    }
    try {
      await sdk.client.fetch(id ? `/admin/delivery-zones/${id}` : "/admin/delivery-zones", {
        method: "POST",
        body,
      })
      toast.success("Zone enregistrée")
      setEditing(null)
      load()
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur lors de l'enregistrement")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (zone: Zone) => {
    const ok = await prompt({
      title: "Supprimer la zone ?",
      description: `La zone « ${zone.name} » ne sera plus desservie.`,
      confirmText: "Supprimer",
      cancelText: "Annuler",
    })
    if (!ok) return
    await sdk.client.fetch(`/admin/delivery-zones/${zone.id}`, { method: "DELETE" })
    toast.success("Zone supprimée")
    load()
  }

  const test = async () => {
    try {
      const res = await sdk.client.fetch<any>("/admin/delivery-zone-check", {
        query: { cap: testCap },
      })
      setTestResult(res.covered ? `Desservi : ${res.zone.name}` : "Non desservi")
    } catch (e: any) {
      setTestResult(e?.message ?? "Erreur")
    }
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h1">Zones de livraison</Heading>
            <Text className="text-ui-fg-subtle" size="small">
              Où la boutique livre, à quel prix et avec quel minimum. Les adresses hors zone ne
              peuvent choisir que le retrait sur place.
            </Text>
          </div>
          <Button onClick={() => setEditing({ ...empty })}>Ajouter une zone</Button>
        </div>
        <div className="flex items-end gap-x-2 px-6 py-4">
          <div className="flex flex-col gap-y-1">
            <Label htmlFor="test-cap">Tester un code postal</Label>
            <Input
              id="test-cap"
              placeholder="20121"
              value={testCap}
              onChange={(e) => setTestCap(e.target.value)}
            />
          </div>
          <Button variant="secondary" onClick={test} disabled={!/^\d{5}$/.test(testCap)}>
            Tester
          </Button>
          {testResult && <Text size="small">{testResult}</Text>}
        </div>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Zone</Table.HeaderCell>
              <Table.HeaderCell>Codes postaux / provinces</Table.HeaderCell>
              <Table.HeaderCell>Livreur</Table.HeaderCell>
              <Table.HeaderCell>Moins d'une palette</Table.HeaderCell>
              <Table.HeaderCell>Par palette</Table.HeaderCell>
              <Table.HeaderCell>Minimum</Table.HeaderCell>
              <Table.HeaderCell>Statut</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {zones.map((z) => (
              <Table.Row key={z.id}>
                <Table.Cell>{z.name}</Table.Cell>
                <Table.Cell>
                  {[list(z.cap_rules), list(z.provinces)].filter(Boolean).join(" · ")}
                </Table.Cell>
                <Table.Cell>{CARRIERS[z.carrier]}</Table.Cell>
                <Table.Cell>{euro(num(z.small_order_price))}</Table.Cell>
                <Table.Cell>{euro(num(z.price_per_pallet))}</Table.Cell>
                <Table.Cell>
                  {num(z.min_order_amount) ? euro(num(z.min_order_amount)) : "Aucun"}
                </Table.Cell>
                <Table.Cell>
                  <Badge color={z.active ? "green" : "grey"} size="2xsmall">
                    {z.active ? "Active" : "Inactive"}
                  </Badge>
                </Table.Cell>
                <Table.Cell className="flex justify-end gap-x-2">
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() =>
                      setEditing({
                        ...z,
                        cap_rules: list(z.cap_rules),
                        provinces: list(z.provinces),
                        small_order_price: num(z.small_order_price),
                        price_per_pallet: num(z.price_per_pallet),
                        min_order_amount: num(z.min_order_amount),
                      })
                    }
                  >
                    Modifier
                  </Button>
                  <Button size="small" variant="danger" onClick={() => remove(z)}>
                    Supprimer
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Container>

      <Drawer open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>{editing?.id ? "Modifier la zone" : "Nouvelle zone"}</Drawer.Title>
          </Drawer.Header>
          {editing && (
            <Drawer.Body className="flex flex-col gap-y-4 overflow-y-auto">
              <Field label="Nom">
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </Field>
              <Field
                label="Codes postaux (CAP)"
                hint="Séparés par des virgules : préfixe (20, 201), plage (20000-20999) ou * pour toute l'Italie."
              >
                <Textarea
                  value={list(editing.cap_rules)}
                  onChange={(e) => setEditing({ ...editing, cap_rules: e.target.value })}
                />
              </Field>
              <Field label="Provinces (sigles)" hint="Ex. MI, BG, BS. Facultatif.">
                <Input
                  value={list(editing.provinces)}
                  onChange={(e) => setEditing({ ...editing, provinces: e.target.value })}
                />
              </Field>
              <Field label="Livré par">
                <Select
                  value={editing.carrier}
                  onValueChange={(v) => setEditing({ ...editing, carrier: v as Zone["carrier"] })}
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {Object.entries(CARRIERS).map(([value, label]) => (
                      <Select.Item key={value} value={value}>
                        {label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Prix moins d'une palette (€ TTC)">
                  <Input
                    type="number"
                    step="0.01"
                    value={editing.small_order_price}
                    onChange={(e) => setEditing({ ...editing, small_order_price: e.target.value })}
                  />
                </Field>
                <Field label="Prix par palette (€ TTC)">
                  <Input
                    type="number"
                    step="0.01"
                    value={editing.price_per_pallet}
                    onChange={(e) => setEditing({ ...editing, price_per_pallet: e.target.value })}
                  />
                </Field>
                <Field label="Commande minimum (€)">
                  <Input
                    type="number"
                    step="0.01"
                    value={editing.min_order_amount}
                    onChange={(e) => setEditing({ ...editing, min_order_amount: e.target.value })}
                  />
                </Field>
                <Field label="Priorité" hint="La plus haute gagne si plusieurs zones correspondent.">
                  <Input
                    type="number"
                    value={editing.priority}
                    onChange={(e) => setEditing({ ...editing, priority: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Délai affiché aux clients" hint="En italien, ex. 3-5 giorni lavorativi">
                <Input
                  value={editing.lead_time ?? ""}
                  onChange={(e) => setEditing({ ...editing, lead_time: e.target.value })}
                />
              </Field>
              <Field label="Description (interne)">
                <Textarea
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </Field>
              <div className="flex items-center gap-x-2">
                <Switch
                  id="zone-active"
                  checked={editing.active}
                  onCheckedChange={(v) => setEditing({ ...editing, active: v })}
                />
                <Label htmlFor="zone-active">Zone active</Label>
              </div>
            </Drawer.Body>
          )}
          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button variant="secondary">Annuler</Button>
            </Drawer.Close>
            <Button onClick={save} isLoading={saving} disabled={!editing?.name}>
              Enregistrer
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}

const Field = ({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-y-1">
    <Label>{label}</Label>
    {children}
    {hint && (
      <Text size="xsmall" className="text-ui-fg-subtle">
        {hint}
      </Text>
    )}
  </div>
)

export const config = defineRouteConfig({
  label: "Zones de livraison",
  icon: MapPin,
})

export default DeliveryZonesPage
