import { AbstractFulfillmentProviderService, MedusaError } from "@medusajs/framework/utils"
import type {
  CalculatedShippingOptionPrice,
  CalculateShippingOptionPriceDTO,
  FulfillmentOption,
} from "@medusajs/framework/types"
import {
  findZoneForAddress,
  palletsForItems,
  quoteDelivery,
  toNumber,
  ZoneLike,
} from "../../lib/zones"

type InjectedDependencies = {
  __pg_connection__?: any
  logger?: any
}

/**
 * Delivery priced by the admin-edited zones (module `delivery_zone`):
 * - orders under one pallet pay the zone's small-order price,
 * - otherwise each started pallet costs the zone's price per pallet,
 * - addresses outside every active zone, or under the zone minimum, are refused
 *   so the customer is steered to pickup.
 *
 * Module providers only see their own module's container, so zones and variant
 * pallet sizes are read with the shared database connection.
 */
class WoodDeliveryProviderService extends AbstractFulfillmentProviderService {
  static identifier = "wood-delivery"

  protected pg_: any
  protected logger_: any

  constructor(deps: InjectedDependencies) {
    super()
    this.pg_ = deps.__pg_connection__
    this.logger_ = deps.logger
  }

  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    return [{ id: "zone-delivery", name: "Consegna a domicilio per zona" }]
  }

  async validateOption(): Promise<boolean> {
    return true
  }

  async canCalculate(): Promise<boolean> {
    return true
  }

  async validateFulfillmentData(_optionData: any, data: any): Promise<any> {
    return data
  }

  protected async loadZones(): Promise<ZoneLike[]> {
    return await this.pg_("delivery_zone")
      .select("*")
      .where({ active: true })
      .whereNull("deleted_at")
  }

  protected async loadPalletsPerUnit(variantIds: string[]): Promise<Record<string, number>> {
    if (!variantIds.length) return {}
    const rows = await this.pg_("product_variant")
      .select("id", "metadata", "weight")
      .whereIn("id", variantIds)
    const map: Record<string, number> = {}
    for (const row of rows) {
      const fromMeta = toNumber(row.metadata?.pallets)
      // Fallback: about one tonne per pallet
      map[row.id] = fromMeta || (row.weight ? Number(row.weight) / 1000 : 0)
    }
    return map
  }

  async calculatePrice(
    _optionData: CalculateShippingOptionPriceDTO["optionData"],
    _data: CalculateShippingOptionPriceDTO["data"],
    context: CalculateShippingOptionPriceDTO["context"]
  ): Promise<CalculatedShippingOptionPrice> {
    const address = context.shipping_address
    if (!address?.postal_code) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Inserisci il CAP di consegna per calcolare la spedizione."
      )
    }

    const zone = findZoneForAddress(
      await this.loadZones(),
      address.postal_code,
      address.province
    )
    if (!zone) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Non consegniamo ancora al CAP ${address.postal_code}. Puoi scegliere il ritiro in sede.`
      )
    }

    const items = (context.items ?? []) as any[]
    const perUnit = await this.loadPalletsPerUnit(
      items.map((i) => i.variant_id).filter(Boolean)
    )
    const pallets = palletsForItems(
      items.map((i) => ({
        quantity: i.quantity,
        pallets_per_unit: perUnit[i.variant_id] ?? 0,
      }))
    )

    const subtotal = items.reduce(
      (sum, i) => sum + toNumber(i.unit_price) * toNumber(i.quantity),
      0
    )
    const minimum = toNumber(zone.min_order_amount)
    if (minimum > 0 && subtotal < minimum) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Per la zona ${zone.name} l'ordine minimo per la consegna è di ${minimum.toFixed(2)} €. Puoi scegliere il ritiro in sede.`
      )
    }

    const quote = quoteDelivery(zone, pallets)
    return {
      calculated_amount: quote.amount,
      is_calculated_price_tax_inclusive: true,
    }
  }

  async createFulfillment(): Promise<any> {
    return { data: {}, labels: [] }
  }

  async cancelFulfillment(): Promise<any> {
    return {}
  }

  async createReturnFulfillment(): Promise<any> {
    return { data: {}, labels: [] }
  }
}

export default WoodDeliveryProviderService
