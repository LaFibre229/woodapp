"use client"

import { checkDelivery, DeliveryCheck as Result } from "@lib/data/shop"
import { CARRIER_LABELS, formatEuro } from "@lib/util/italy"
import { Button } from "@medusajs/ui"
import { useState } from "react"

/** "Consegnate da me?" postcode check, with a delivery estimate for the format. */
export default function DeliveryCheck({
  variantId,
  quantity = 1,
}: {
  variantId?: string
  quantity?: number
}) {
  const [cap, setCap] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  const run = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\d{5}$/.test(cap)) {
      setResult({ covered: false, message: "Inserisci un CAP valido di 5 cifre." })
      return
    }
    setLoading(true)
    setResult(await checkDelivery(cap, variantId, quantity))
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-y-2" data-testid="delivery-check">
      <span className="text-sm">Consegnate da me?</span>
      <form onSubmit={run} className="flex gap-x-2">
        <input
          inputMode="numeric"
          maxLength={5}
          placeholder="Il tuo CAP"
          aria-label="CAP"
          value={cap}
          onChange={(e) => setCap(e.target.value.replace(/\D/g, ""))}
          className="flex-1 h-10 px-3 border rounded-rounded border-ui-border-base bg-ui-bg-field text-small-regular"
        />
        <Button type="submit" variant="secondary" className="h-10" isLoading={loading}>
          Verifica
        </Button>
      </form>
      {result && (
        <div className="text-small-regular">
          {result.covered && result.zone ? (
            <div className="flex flex-col gap-y-1">
              <span className="text-green-700">
                Sì, consegniamo nella zona {result.zone.name}.
              </span>
              {result.estimate && (
                <span className="text-ui-fg-subtle">
                  Consegna stimata per questa quantità: {formatEuro(result.estimate.amount)}
                  {result.estimate.billable_pallets > 0 &&
                    ` (${result.estimate.billable_pallets} ${
                      result.estimate.billable_pallets === 1 ? "bancale" : "bancali"
                    })`}
                </span>
              )}
              <span className="text-ui-fg-subtle">
                {CARRIER_LABELS[result.zone.carrier] ?? ""}
                {result.zone.lead_time ? ` · ${result.zone.lead_time}` : ""}
                {result.zone.min_order_amount > 0
                  ? ` · ordine minimo ${formatEuro(result.zone.min_order_amount)}`
                  : ""}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-y-1">
              <span className="text-rose-600">{result.message}</span>
              {result.pickup_enabled && (
                <span className="text-ui-fg-subtle">
                  Puoi ritirare gratuitamente presso la nostra sede
                  {result.pickup_address ? `: ${result.pickup_address}` : "."}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
