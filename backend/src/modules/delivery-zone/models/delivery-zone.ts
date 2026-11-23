import { model } from "@medusajs/framework/utils"

/**
 * A covered delivery area. A postcode (CAP) is covered when it matches one of
 * the zone's CAP rules or its province is listed.
 *
 * CAP rules: "*" (all of Italy), a prefix such as "20" or "201", or a range
 * such as "20000-20999".
 */
const DeliveryZone = model.define("delivery_zone", {
  id: model.id({ prefix: "dzone" }).primaryKey(),
  name: model.text(),
  description: model.text().nullable(),
  active: model.boolean().default(true),
  // JSON array of strings, e.g. ["20", "21000-21999", "*"]
  cap_rules: model.json().nullable(),
  // JSON array of province codes (sigle), e.g. ["MI", "BG"]
  provinces: model.json().nullable(),
  carrier: model.enum(["own_truck", "pallet_carrier", "courier"]).default("pallet_carrier"),
  // Price for orders smaller than one pallet (bags, a stove), VAT included
  small_order_price: model.bigNumber().default(0),
  // Price per started pallet, VAT included
  price_per_pallet: model.bigNumber().default(0),
  // Minimum order subtotal for delivery in this zone (0 = none)
  min_order_amount: model.bigNumber().default(0),
  // Typical lead time shown to customers, e.g. "3-5 giorni lavorativi"
  lead_time: model.text().nullable(),
  // Higher wins when several zones match the same CAP
  priority: model.number().default(0),
})

export default DeliveryZone
