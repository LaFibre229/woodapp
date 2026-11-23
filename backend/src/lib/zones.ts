/**
 * Pure helpers for Italian delivery zones, shared by the API routes and the
 * shipping provider. Kept free of Medusa imports so they are easy to test.
 */

export type ZoneLike = {
  id: string
  name: string
  active?: boolean
  cap_rules?: unknown
  provinces?: unknown
  carrier?: string
  small_order_price?: number | string | { valueOf(): number } | null
  price_per_pallet?: number | string | { valueOf(): number } | null
  min_order_amount?: number | string | { valueOf(): number } | null
  priority?: number | null
  lead_time?: string | null
}

export const toNumber = (v: unknown): number => {
  if (v === null || v === undefined || v === "") return 0
  if (typeof v === "number") return v
  if (typeof v === "string") return Number(v) || 0
  if (typeof v === "object") {
    const anyV = v as any
    if (typeof anyV.numeric === "number") return anyV.numeric
    if (anyV.value !== undefined) return Number(anyV.value) || 0
    return Number(anyV.valueOf()) || 0
  }
  return Number(v) || 0
}

export const asStringArray = (v: unknown): string[] => {
  if (!v) return []
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean)
  if (typeof v === "string") {
    return v
      .split(/[,;\n]/)
      .map((x) => x.trim())
      .filter(Boolean)
  }
  if (typeof v === "object") {
    const inner = (v as any).rules ?? (v as any).codes
    if (inner) return asStringArray(inner)
  }
  return []
}

/** Italian CAP: exactly five digits. */
export const normalizeCap = (cap?: string | null): string | null => {
  if (!cap) return null
  const digits = String(cap).replace(/\s+/g, "")
  return /^\d{5}$/.test(digits) ? digits : null
}

/**
 * Returns how specifically a rule matches a CAP (0 = no match). Longer
 * prefixes and narrower ranges score higher so they win over "*".
 */
export const capRuleScore = (rule: string, cap: string): number => {
  const r = rule.trim()
  if (!r) return 0
  if (r === "*") return 1
  const range = r.match(/^(\d{1,5})\s*-\s*(\d{1,5})$/)
  if (range) {
    const from = Number(range[1].padEnd(5, "0"))
    const to = Number(range[2].padEnd(5, "9"))
    const n = Number(cap)
    if (n >= from && n <= to) {
      const width = to - from + 1
      return 2 + Math.max(0, 5 - Math.log10(width))
    }
    return 0
  }
  if (/^\d{1,5}$/.test(r) && cap.startsWith(r)) {
    return 2 + r.length
  }
  return 0
}

export const zoneMatchScore = (
  zone: ZoneLike,
  cap: string | null,
  province?: string | null
): number => {
  let best = 0
  if (cap) {
    for (const rule of asStringArray(zone.cap_rules)) {
      best = Math.max(best, capRuleScore(rule, cap))
    }
  }
  const prov = province?.trim().toUpperCase()
  if (prov) {
    const provinces = asStringArray(zone.provinces).map((p) => p.toUpperCase())
    if (provinces.includes(prov)) {
      best = Math.max(best, 6)
    }
  }
  return best
}

export function findZoneForAddress<T extends ZoneLike>(
  zones: T[],
  postalCode?: string | null,
  province?: string | null
): T | null {
  const cap = normalizeCap(postalCode)
  let winner: T | null = null
  let winnerKey: [number, number] = [-Infinity, 0]
  for (const zone of zones) {
    if (zone.active === false) continue
    const score = zoneMatchScore(zone, cap, province)
    if (!score) continue
    const key: [number, number] = [zone.priority ?? 0, score]
    if (
      key[0] > winnerKey[0] ||
      (key[0] === winnerKey[0] && key[1] > winnerKey[1])
    ) {
      winner = zone
      winnerKey = key
    }
  }
  return winner
}

/** Pallets an order takes; variants carry `metadata.pallets` (e.g. 1, 0.5, 1/70). */
export const palletsForItems = (
  items: { quantity: number | string; pallets_per_unit: number }[]
): number =>
  items.reduce(
    (sum, i) => sum + toNumber(i.quantity) * (Number(i.pallets_per_unit) || 0),
    0
  )

export type DeliveryQuote = {
  zone_id: string
  zone_name: string
  carrier?: string
  pallets: number
  billable_pallets: number
  amount: number
  lead_time?: string | null
}

export const quoteDelivery = (zone: ZoneLike, pallets: number): DeliveryQuote => {
  const rounded = Math.round(pallets * 1000) / 1000
  // Pallet shares are stored rounded (1/70 = 0.0143), so 140 bags give 2.002
  // pallets: allow a 2% tolerance before charging a started pallet.
  const billable = rounded < 0.98 ? 0 : Math.max(1, Math.ceil(rounded - 0.02))
  const amount =
    billable === 0
      ? toNumber(zone.small_order_price)
      : billable * toNumber(zone.price_per_pallet)
  return {
    zone_id: zone.id,
    zone_name: zone.name,
    carrier: zone.carrier,
    pallets: rounded,
    billable_pallets: billable,
    amount: Math.round(amount * 100) / 100,
    lead_time: zone.lead_time ?? null,
  }
}

/** Deposit rounded to the cent; the balance is the rest. */
export const computeDeposit = (total: number, percent: number) => {
  const p = Math.min(100, Math.max(0, Number(percent) || 0))
  const deposit = Math.round(total * p) / 100
  return {
    percent: p,
    total: Math.round(total * 100) / 100,
    deposit_amount: deposit,
    balance_amount: Math.round((total - deposit) * 100) / 100,
  }
}
