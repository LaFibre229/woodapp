import { MedusaService } from "@medusajs/framework/utils"
import DeliveryZone from "./models/delivery-zone"
import { findZoneForAddress, ZoneLike } from "../../lib/zones"

class DeliveryZoneModuleService extends MedusaService({ DeliveryZone }) {
  async findZone(postalCode?: string | null, province?: string | null) {
    const zones = await this.listDeliveryZones({ active: true })
    return findZoneForAddress(zones as unknown as ZoneLike[], postalCode, province)
  }
}

export default DeliveryZoneModuleService
