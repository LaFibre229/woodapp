"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

// Labels for the technical specs kept in product metadata
const SPEC_LABELS: Record<string, string> = {
  species: "Essenza",
  length_cm: "Lunghezza (cm)",
  moisture: "Umidità",
  certification: "Certificazione",
  ash: "Ceneri",
  diameter_mm: "Diametro (mm)",
  bag_kg: "Peso sacco (kg)",
  fuel: "Combustibile",
  power_kw: "Potenza (kW)",
  ducted: "Canalizzabile",
  room_m2: "Riscalda fino a (m²)",
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const isStove = product.type?.value?.toLowerCase().includes("stufa")
  const tabs = [
    {
      label: "Caratteristiche",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Consegna e ritiro",
      component: <ShippingInfoTab />,
    },
    ...(isStove
      ? [{ label: "Installazione e incentivi", component: <StoveInfoTab /> }]
      : []),
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const formatSpec = (value: unknown) =>
  typeof value === "boolean" ? (value ? "Sì" : "No") : String(value)

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  const specs = Object.entries((product.metadata ?? {}) as Record<string, unknown>).filter(
    ([k, v]) => SPEC_LABELS[k] && v !== null && v !== undefined && v !== ""
  )
  return (
    <div className="text-[14px] leading-relaxed text-ui-fg-subtle py-6">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <dt className="font-semibold text-bark-900">Tipologia</dt>
          <dd>{product.type ? product.type.value : "-"}</dd>
        </div>
        {product.material && (
          <div>
            <dt className="font-semibold text-bark-900">Materiale</dt>
            <dd>{product.material}</dd>
          </div>
        )}
        {specs.map(([k, v]) => (
          <div key={k}>
            <dt className="font-semibold text-bark-900">{SPEC_LABELS[k]}</dt>
            <dd>{formatSpec(v)}</dd>
          </div>
        ))}
        {product.origin_country && (
          <div>
            <dt className="font-semibold text-bark-900">Origine</dt>
            <dd>{product.origin_country.toUpperCase()}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-[14px] leading-relaxed text-ui-fg-subtle py-6">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-3">
          <FastDelivery />
          <div>
            <span className="font-semibold text-bark-900">Consegna in tutta Italia</span>
            <p className="max-w-sm">
              Consegniamo con i nostri camion o con corriere bancali. Il costo dipende dalla
              zona e dal numero di bancali: verifica il tuo CAP qui accanto.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-3">
          <Refresh />
          <div>
            <span className="font-semibold text-bark-900">Ritiro in sede gratuito</span>
            <p className="max-w-sm">
              Puoi scegliere il ritiro presso la nostra sede al momento dell&apos;ordine.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-3">
          <Back />
          <div>
            <span className="font-semibold text-bark-900">Acconto per prenotare</span>
            <p className="max-w-sm">
              Paghi un acconto all&apos;ordine e il saldo prima della consegna o al ritiro.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const StoveInfoTab = () => (
  <div className="text-[14px] leading-relaxed text-ui-fg-subtle py-6 flex flex-col gap-y-4">
    <p>
      La stufa viene venduta senza installazione. Per legge l&apos;installazione deve essere
      eseguita da un tecnico abilitato, che rilascia la dichiarazione di conformità. Possiamo
      metterti in contatto con un installatore della tua zona.
    </p>
    <p>
      Le stufe ad alta efficienza possono accedere agli incentivi statali (ad esempio il Conto
      Termico). Verifica i requisiti con il tuo installatore o sul sito del GSE.
    </p>
  </div>
)

export default ProductTabs
