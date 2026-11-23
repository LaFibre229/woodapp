import {
  capRuleScore,
  computeDeposit,
  findZoneForAddress,
  normalizeCap,
  palletsForItems,
  quoteDelivery,
} from "../zones"

const zones = [
  { id: "all", name: "Italia", cap_rules: ["*"], small_order_price: 50, price_per_pallet: 100 },
  { id: "north", name: "Nord", cap_rules: ["10000-49999"], small_order_price: 39, price_per_pallet: 69 },
  { id: "milano", name: "Milano", cap_rules: ["201"], price_per_pallet: 49, small_order_price: 20 },
  { id: "bg", name: "Bergamo", provinces: ["BG"], price_per_pallet: 59, small_order_price: 25 },
  { id: "off", name: "Off", cap_rules: ["20121"], active: false },
]

describe("zones", () => {
  it("normalizes CAPs", () => {
    expect(normalizeCap(" 20121 ")).toBe("20121")
    expect(normalizeCap("2012")).toBeNull()
    expect(normalizeCap("abcde")).toBeNull()
  })

  it("scores rules by specificity", () => {
    expect(capRuleScore("*", "20121")).toBe(1)
    expect(capRuleScore("201", "20121")).toBeGreaterThan(capRuleScore("20", "20121"))
    expect(capRuleScore("20000-20999", "20121")).toBeGreaterThan(0)
    expect(capRuleScore("20000-20999", "21000")).toBe(0)
    expect(capRuleScore("07-09", "09123")).toBeGreaterThan(0)
  })

  it("picks the most specific active zone", () => {
    expect(findZoneForAddress(zones, "20121")?.id).toBe("milano")
    expect(findZoneForAddress(zones, "25100")?.id).toBe("north")
    expect(findZoneForAddress(zones, "24100", "bg")?.id).toBe("bg")
    expect(findZoneForAddress(zones, "90100")?.id).toBe("all")
    expect(findZoneForAddress(zones.slice(1), "90100")).toBeNull()
  })

  it("prices by started pallet with a small-order price", () => {
    const bag = 0.014286
    expect(quoteDelivery(zones[1], palletsForItems([{ quantity: 10, pallets_per_unit: bag }])).amount).toBe(39)
    expect(quoteDelivery(zones[1], palletsForItems([{ quantity: 70, pallets_per_unit: bag }])).billable_pallets).toBe(1)
    expect(quoteDelivery(zones[1], palletsForItems([{ quantity: 140, pallets_per_unit: 0.0143 }])).billable_pallets).toBe(2)
    expect(quoteDelivery(zones[1], 1.5).amount).toBe(138)
  })

  it("computes the deposit to the cent", () => {
    expect(computeDeposit(123.45, 50)).toEqual({
      percent: 50,
      total: 123.45,
      deposit_amount: 61.73,
      balance_amount: 61.72,
    })
    expect(computeDeposit(100, 150).deposit_amount).toBe(100)
  })
})
