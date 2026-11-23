import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BuildingStorefront } from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Switch,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useEffect, useState } from "react"
import { sdk } from "../../../lib/sdk"

type Settings = Record<string, any>

const SECTIONS: {
  title: string
  description: string
  fields: { key: string; label: string; hint?: string; multiline?: boolean; type?: string }[]
}[] = [
  {
    title: "Société",
    description:
      "Affichées dans le pied de page, les mentions légales et les factures du site. À compléter dès que la société est créée.",
    fields: [
      { key: "company_name", label: "Raison sociale" },
      { key: "legal_form", label: "Forme juridique", hint: "Ex. S.r.l., ditta individuale" },
      { key: "vat_number", label: "Numéro de TVA (Partita IVA)" },
      { key: "tax_code", label: "Code fiscal (Codice fiscale)" },
      { key: "rea_number", label: "Numéro REA" },
      { key: "share_capital", label: "Capital social" },
      { key: "pec", label: "PEC (e-mail certifié)" },
      { key: "sdi_code", label: "Code SDI" },
    ],
  },
  {
    title: "Coordonnées",
    description: "Adresse de l'entreprise et contacts affichés sur la boutique.",
    fields: [
      { key: "address_line", label: "Adresse" },
      { key: "postal_code", label: "Code postal (CAP)" },
      { key: "city", label: "Ville" },
      { key: "province", label: "Province (sigle)", hint: "Ex. MI, TO, BG" },
      { key: "email", label: "E-mail" },
      { key: "phone", label: "Téléphone" },
      { key: "whatsapp", label: "WhatsApp" },
      { key: "opening_hours", label: "Horaires d'ouverture", multiline: true },
    ],
  },
  {
    title: "Retrait sur place",
    description:
      "Par défaut, le retrait se fait à l'adresse de l'entreprise. Renseignez une autre adresse seulement si le dépôt est ailleurs.",
    fields: [
      { key: "pickup_address", label: "Adresse de retrait (facultatif)" },
      { key: "pickup_notes", label: "Instructions de retrait", multiline: true },
    ],
  },
]

const ShopSettingsPage = () => {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    sdk.client
      .fetch<{ shop_settings: Settings }>("/admin/shop-settings")
      .then(({ shop_settings }) => setSettings(shop_settings))
      .catch(() => toast.error("Impossible de charger les paramètres"))
  }, [])

  const set = (key: string, value: unknown) =>
    setSettings((s) => ({ ...(s ?? {}), [key]: value }))

  const save = async () => {
    if (!settings) return
    setSaving(true)
    try {
      const body: Settings = {}
      for (const section of SECTIONS) {
        for (const f of section.fields) body[f.key] = settings[f.key] || null
      }
      body.company_name = settings.company_name || "Tempio del Riscaldamento"
      body.pickup_enabled = !!settings.pickup_enabled
      body.deposit_percent = Number(settings.deposit_percent ?? 50)
      body.business_deposit_percent =
        settings.business_deposit_percent === "" ||
        settings.business_deposit_percent === null ||
        settings.business_deposit_percent === undefined
          ? null
          : Number(settings.business_deposit_percent)
      const { shop_settings } = await sdk.client.fetch<{ shop_settings: Settings }>(
        "/admin/shop-settings",
        { method: "POST", body }
      )
      setSettings(shop_settings)
      toast.success("Paramètres enregistrés")
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur lors de l'enregistrement")
    } finally {
      setSaving(false)
    }
  }

  if (!settings) {
    return (
      <Container>
        <Text>Chargement…</Text>
      </Container>
    )
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Paramètres de la boutique</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Informations de l'entreprise, acompte et retrait. Modifiables à tout moment, sans
            développeur.
          </Text>
        </div>
        <Button onClick={save} isLoading={saving}>
          Enregistrer
        </Button>
      </Container>

      <Container className="flex flex-col gap-y-4 px-6 py-4">
        <div>
          <Heading level="h2">Acompte à la commande</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Pourcentage du total payé par le client pour réserver sa commande. Le solde est
            payé avant la livraison ou au retrait.
          </Text>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-y-1">
            <Label htmlFor="deposit_percent">Acompte particuliers (%)</Label>
            <Input
              id="deposit_percent"
              type="number"
              min={0}
              max={100}
              value={settings.deposit_percent ?? 50}
              onChange={(e) => set("deposit_percent", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-1">
            <Label htmlFor="business_deposit_percent">Acompte entreprises (%)</Label>
            <Input
              id="business_deposit_percent"
              type="number"
              min={0}
              max={100}
              placeholder="Identique aux particuliers"
              value={settings.business_deposit_percent ?? ""}
              onChange={(e) => set("business_deposit_percent", e.target.value)}
            />
          </div>
        </div>
      </Container>

      {SECTIONS.map((section) => (
        <Container key={section.title} className="flex flex-col gap-y-4 px-6 py-4">
          <div>
            <Heading level="h2">{section.title}</Heading>
            <Text className="text-ui-fg-subtle" size="small">
              {section.description}
            </Text>
          </div>
          {section.title === "Retrait sur place" && (
            <div className="flex items-center gap-x-2">
              <Switch
                id="pickup_enabled"
                checked={!!settings.pickup_enabled}
                onCheckedChange={(v) => set("pickup_enabled", v)}
              />
              <Label htmlFor="pickup_enabled">Proposer le retrait sur place</Label>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {section.fields.map((f) => (
              <div key={f.key} className="flex flex-col gap-y-1">
                <Label htmlFor={f.key}>{f.label}</Label>
                {f.multiline ? (
                  <Textarea
                    id={f.key}
                    value={settings[f.key] ?? ""}
                    onChange={(e) => set(f.key, e.target.value)}
                  />
                ) : (
                  <Input
                    id={f.key}
                    value={settings[f.key] ?? ""}
                    placeholder={f.hint}
                    onChange={(e) => set(f.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </Container>
      ))}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Société et acompte",
  icon: BuildingStorefront,
})

export default ShopSettingsPage
