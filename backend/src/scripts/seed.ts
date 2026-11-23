import type { ExecArgs } from "@medusajs/framework/types"
import fs from "node:fs"
import path from "node:path"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createCustomerGroupsWorkflow,
  createInventoryLevelsWorkflow,
  createPriceListsWorkflow,
  createProductCategoriesWorkflow,
  createProductTypesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRatesWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateRegionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { SHOP_SETTINGS_MODULE } from "../modules/shop-settings"
import type ShopSettingsModuleService from "../modules/shop-settings/service"
import { DELIVERY_ZONE_MODULE } from "../modules/delivery-zone"
import type DeliveryZoneModuleService from "../modules/delivery-zone/service"
import { BUSINESS_GROUP_NAME } from "../lib/settings"
import { linkPaymentProviders } from "../lib/payment-setup"

/**
 * Demo data for development: Italy region with Italian VAT, the business
 * customer group and price list, delivery zones covering all of Italy, pickup
 * at the business address, and sample firewood, pellet and stove products.
 *
 * Prices and pallet sizes are placeholders to replace with the real catalogue.
 * Run once on an empty database: `yarn seed`.
 */

const PROVIDER_DELIVERY = "wood-delivery_wood"
const PROVIDER_MANUAL = "manual_manual"

type Format = {
  title: string
  sku: string
  price: number | null // VAT included, EUR. null = quote only
  business_price?: number
  pallets: number
  weight: number // kg
  stock?: number
  quote_only?: boolean
}

type SeedProduct = {
  title: string
  handle: string
  subtitle: string
  description: string
  category: string
  type: string
  material?: string
  metadata?: Record<string, unknown>
  formats: Format[]
}

const truck = (sku: string): Format => ({
  title: "Camion completo",
  sku,
  price: null,
  pallets: 0,
  weight: 0,
  quote_only: true,
})

const PRODUCTS: SeedProduct[] = [
  {
    title: "Legna di faggio 33 cm",
    handle: "legna-faggio-33",
    subtitle: "Stagionata, umidità inferiore al 20%",
    description:
      "Legna da ardere di faggio spaccata, lunghezza 33 cm, stagionata almeno 18 mesi. Alto potere calorifico e brace duratura, ideale per stufe, camini e cucine a legna.",
    category: "Legna da ardere",
    type: "Legna da ardere",
    material: "Faggio",
    metadata: { species: "Faggio", length_cm: 33, moisture: "< 20%" },
    formats: [
      { title: "Sacco 20 kg", sku: "LF33-S20", price: 9.9, business_price: 8.9, pallets: 1 / 60, weight: 20, stock: 600 },
      { title: "Bancale 10 q", sku: "LF33-B10", price: 239, business_price: 219, pallets: 1, weight: 1000, stock: 40 },
      { title: "Bancale 20 q", sku: "LF33-B20", price: 459, business_price: 419, pallets: 1, weight: 2000, stock: 20 },
      truck("LF33-CAM"),
    ],
  },
  {
    title: "Legna di quercia 33 cm",
    handle: "legna-quercia-33",
    subtitle: "Stagionata, umidità inferiore al 20%",
    description:
      "Legna da ardere di quercia spaccata, lunghezza 33 cm. Legno denso che brucia a lungo, perfetto per il riscaldamento continuo.",
    category: "Legna da ardere",
    type: "Legna da ardere",
    material: "Quercia",
    metadata: { species: "Quercia", length_cm: 33, moisture: "< 20%" },
    formats: [
      { title: "Sacco 20 kg", sku: "LQ33-S20", price: 10.5, business_price: 9.5, pallets: 1 / 60, weight: 20, stock: 400 },
      { title: "Bancale 10 q", sku: "LQ33-B10", price: 249, business_price: 229, pallets: 1, weight: 1000, stock: 30 },
      truck("LQ33-CAM"),
    ],
  },
  {
    title: "Legna per forno a legna 25 cm",
    handle: "legna-forno-25",
    subtitle: "Per pizzerie e panifici",
    description:
      "Legna di faggio e carpino tagliata a 25 cm, adatta ai forni a legna di pizzerie, panifici e agriturismi.",
    category: "Legna da ardere",
    type: "Legna da ardere",
    material: "Faggio e carpino",
    metadata: { species: "Faggio, carpino", length_cm: 25, moisture: "< 20%" },
    formats: [
      { title: "Bancale 10 q", sku: "LFO25-B10", price: 255, business_price: 229, pallets: 1, weight: 1000, stock: 30 },
      truck("LFO25-CAM"),
    ],
  },
  {
    title: "Pellet di abete ENplus A1",
    handle: "pellet-abete-enplus-a1",
    subtitle: "Sacchi da 15 kg, certificato ENplus A1",
    description:
      "Pellet 100% abete certificato ENplus A1, basso residuo di cenere (< 0,7%), diametro 6 mm. Sacchi da 15 kg, bancale da 70 sacchi.",
    category: "Pellet",
    type: "Pellet",
    material: "Abete",
    metadata: { certification: "ENplus A1", ash: "< 0,7%", diameter_mm: 6, bag_kg: 15 },
    formats: [
      { title: "Sacco 15 kg", sku: "PAB-S15", price: 6.9, business_price: 6.3, pallets: 1 / 70, weight: 15, stock: 3000 },
      { title: "Mezzo bancale (35 sacchi)", sku: "PAB-B35", price: 235, business_price: 214, pallets: 0.5, weight: 525, stock: 40 },
      { title: "Bancale (70 sacchi)", sku: "PAB-B70", price: 459, business_price: 419, pallets: 1, weight: 1050, stock: 40 },
      truck("PAB-CAM"),
    ],
  },
  {
    title: "Pellet di faggio ENplus A1",
    handle: "pellet-faggio-enplus-a1",
    subtitle: "Sacchi da 15 kg, alta resa",
    description:
      "Pellet di faggio certificato ENplus A1, combustione lunga e alta resa calorica. Sacchi da 15 kg, bancale da 70 sacchi.",
    category: "Pellet",
    type: "Pellet",
    material: "Faggio",
    metadata: { certification: "ENplus A1", ash: "< 0,7%", diameter_mm: 6, bag_kg: 15 },
    formats: [
      { title: "Sacco 15 kg", sku: "PFA-S15", price: 7.2, business_price: 6.6, pallets: 1 / 70, weight: 15, stock: 2000 },
      { title: "Bancale (70 sacchi)", sku: "PFA-B70", price: 479, business_price: 439, pallets: 1, weight: 1050, stock: 25 },
      truck("PFA-CAM"),
    ],
  },
  {
    title: "Stufa a pellet 9 kW",
    handle: "stufa-pellet-9kw",
    subtitle: "Per ambienti fino a 90 m²",
    description:
      "Stufa a pellet ad aria da 9 kW con termostato e programmazione settimanale. L'installazione deve essere eseguita da un installatore abilitato e non è inclusa: puoi richiederla a parte.",
    category: "Stufe",
    type: "Stufa",
    metadata: { fuel: "Pellet", power_kw: 9, ducted: false, room_m2: 90 },
    formats: [
      { title: "Standard", sku: "STP-9", price: 1290, business_price: 1150, pallets: 0.5, weight: 95, stock: 5 },
    ],
  },
  {
    title: "Stufa a legna 8 kW",
    handle: "stufa-legna-8kw",
    subtitle: "In ghisa, per ambienti fino a 80 m²",
    description:
      "Stufa a legna in ghisa da 8 kW con vetro autopulente. L'installazione deve essere eseguita da un installatore abilitato e non è inclusa: puoi richiederla a parte.",
    category: "Stufe",
    type: "Stufa",
    metadata: { fuel: "Legna", power_kw: 8, ducted: false, room_m2: 80 },
    formats: [
      { title: "Standard", sku: "STL-8", price: 890, business_price: 799, pallets: 0.5, weight: 120, stock: 5 },
    ],
  },
]

// Rough split of Italian CAPs by area. Editable in the admin.
const ZONES = [
  { name: "Nord Italia", cap_rules: ["10000-39999", "40000-49999"], small_order_price: 39, price_per_pallet: 69, min_order_amount: 0, lead_time: "3-5 giorni lavorativi", priority: 0, carrier: "pallet_carrier" as const },
  { name: "Centro Italia", cap_rules: ["00000-06999", "50000-67999"], small_order_price: 45, price_per_pallet: 79, min_order_amount: 0, lead_time: "3-6 giorni lavorativi", priority: 0, carrier: "pallet_carrier" as const },
  { name: "Sud Italia", cap_rules: ["70000-89999"], small_order_price: 49, price_per_pallet: 89, min_order_amount: 0, lead_time: "4-7 giorni lavorativi", priority: 0, carrier: "pallet_carrier" as const },
  { name: "Sicilia", cap_rules: ["90000-98999"], small_order_price: 59, price_per_pallet: 119, min_order_amount: 0, lead_time: "5-8 giorni lavorativi", priority: 0, carrier: "pallet_carrier" as const },
  { name: "Sardegna", cap_rules: ["07000-09999"], small_order_price: 59, price_per_pallet: 129, min_order_amount: 0, lead_time: "5-9 giorni lavorativi", priority: 0, carrier: "pallet_carrier" as const },
]

export default async function seedWoodShop({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT)
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
  const storeModule = container.resolve(Modules.STORE)
  const settingsModule = container.resolve<ShopSettingsModuleService>(SHOP_SETTINGS_MODULE)
  const zoneModule = container.resolve<DeliveryZoneModuleService>(DELIVERY_ZONE_MODULE)

  // Store, currency and sales channel
  logger.info("Seeding store...")
  const [store] = await storeModule.listStores()
  // Reuse the default sales channel Medusa creates, renamed for the shop
  let salesChannel = store.default_sales_channel_id
    ? await salesChannelModule.retrieveSalesChannel(store.default_sales_channel_id)
    : (await salesChannelModule.listSalesChannels({}, { take: 1 }))[0]
  if (salesChannel) {
    salesChannel = await salesChannelModule.updateSalesChannels(salesChannel.id, {
      name: "Negozio online",
      description: "Sito e-commerce",
    })
  } else {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: { salesChannelsData: [{ name: "Negozio online", description: "Sito e-commerce" }] },
    })
    salesChannel = result[0]
  }
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        name: "Tempio del Riscaldamento",
        supported_currencies: [{ currency_code: "eur", is_default: true, is_tax_inclusive: true }],
        default_sales_channel_id: salesChannel.id,
      },
    },
  })

  // Region Italy, prices shown VAT included
  logger.info("Seeding region and VAT...")
  const { result: regions } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Italia",
          currency_code: "eur",
          countries: ["it"],
          // Stripe and bank transfer are added below (linkPaymentProviders)
          payment_providers: ["pp_system_default"],
          automatic_taxes: true,
          is_tax_inclusive: true,
        },
      ],
    },
  })
  const region = regions[0]
  const paymentProviders = await linkPaymentProviders(container, updateRegionsWorkflow)
  logger.info(`Payment providers: ${paymentProviders.join(", ")}`)

  // Product types drive the VAT rate (firewood 10%, the rest 22%)
  const { result: types } = await createProductTypesWorkflow(container).run({
    input: {
      product_types: [{ value: "Legna da ardere" }, { value: "Pellet" }, { value: "Stufa" }],
    },
  })
  const typeId = (value: string) => types.find((t) => t.value === value)!.id

  const { result: taxRegions } = await createTaxRegionsWorkflow(container).run({
    input: [
      {
        country_code: "it",
        provider_id: "tp_system",
        default_tax_rate: { rate: 22, code: "IVA22", name: "IVA 22%" },
      },
    ],
  })
  await createTaxRatesWorkflow(container).run({
    input: [
      {
        tax_region_id: taxRegions[0].id,
        rate: 10,
        code: "IVA10",
        name: "IVA 10% legna da ardere",
        rules: [{ reference: "product_type", reference_id: typeId("Legna da ardere") }],
      },
    ],
  })

  // Stock location = business address (pickup point)
  logger.info("Seeding stock location, delivery and pickup...")
  const { result: locations } = await createStockLocationsWorkflow(container).run({
    input: {
      locations: [
        {
          name: "Sede e deposito",
          address: { address_1: "Indirizzo da definire", city: "Da definire", country_code: "IT" },
        },
      ],
    },
  })
  const location = locations[0]
  await updateStoresWorkflow(container).run({
    input: { selector: { id: store.id }, update: { default_location_id: location.id } },
  })
  for (const provider of [PROVIDER_MANUAL, PROVIDER_DELIVERY]) {
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: provider },
    })
  }

  let [profile] = await fulfillmentModule.listShippingProfiles({ type: "default" })
  if (!profile) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: { data: [{ name: "Profilo standard", type: "default" }] },
    })
    profile = result[0]
  }

  const deliverySet = await fulfillmentModule.createFulfillmentSets({
    name: "Consegna in Italia",
    type: "shipping",
    service_zones: [{ name: "Italia", geo_zones: [{ country_code: "it", type: "country" }] }],
  })
  const pickupSet = await fulfillmentModule.createFulfillmentSets({
    name: "Ritiro in sede",
    type: "pickup",
    service_zones: [{ name: "Sede", geo_zones: [{ country_code: "it", type: "country" }] }],
  })
  for (const set of [deliverySet, pickupSet]) {
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: set.id },
    })
  }

  const storeRules = [
    { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
    { attribute: "is_return", value: "false", operator: "eq" as const },
  ]
  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Consegna a domicilio",
        price_type: "calculated",
        provider_id: PROVIDER_DELIVERY,
        service_zone_id: deliverySet.service_zones[0].id,
        shipping_profile_id: profile.id,
        type: {
          label: "Consegna",
          description: "Prezzo in base alla zona e al numero di bancali",
          code: "delivery",
        },
        data: { id: "zone-delivery" },
        rules: storeRules,
      },
      {
        name: "Ritiro in sede",
        price_type: "flat",
        provider_id: PROVIDER_MANUAL,
        service_zone_id: pickupSet.service_zones[0].id,
        shipping_profile_id: profile.id,
        type: { label: "Ritiro", description: "Ritiro gratuito presso la nostra sede", code: "pickup" },
        prices: [
          { currency_code: "eur", amount: 0 },
          { region_id: region.id, amount: 0 },
        ],
        rules: storeRules,
      },
    ],
  })

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: location.id, add: [salesChannel.id] },
  })

  // Publishable key for the storefront
  const { data: keys } = await query.graph({
    entity: "api_key",
    fields: ["id", "token"],
    filters: { type: "publishable" },
  })
  let apiKey = keys[0] as { id: string; token: string } | undefined
  if (!apiKey) {
    const { result } = await createApiKeysWorkflow(container).run({
      input: { api_keys: [{ title: "Storefront", type: "publishable", created_by: "" }] },
    })
    apiKey = result[0] as any
  }
  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: { id: apiKey!.id, add: [salesChannel.id] },
  })

  // Business customers
  logger.info("Seeding business group...")
  const { result: groups } = await createCustomerGroupsWorkflow(container).run({
    input: { customersData: [{ name: BUSINESS_GROUP_NAME }] },
  })
  const businessGroup = groups[0]

  // Catalogue
  logger.info("Seeding catalogue...")
  const { result: categories } = await createProductCategoriesWorkflow(container).run({
    input: {
      product_categories: [
        { name: "Legna da ardere", handle: "legna-da-ardere", is_active: true },
        { name: "Pellet", handle: "pellet", is_active: true },
        { name: "Stufe", handle: "stufe", is_active: true },
      ],
    },
  })
  const categoryId = (name: string) => categories.find((c) => c.name === name)!.id

  const { result: products } = await createProductsWorkflow(container).run({
    input: {
      products: PRODUCTS.map((p) => ({
        title: p.title,
        handle: p.handle,
        subtitle: p.subtitle,
        description: p.description,
        status: ProductStatus.PUBLISHED,
        material: p.material,
        metadata: p.metadata,
        type_id: typeId(p.type),
        category_ids: [categoryId(p.category)],
        shipping_profile_id: profile.id,
        sales_channels: [{ id: salesChannel.id }],
        options: [{ title: "Formato", values: p.formats.map((f) => f.title) }],
        variants: p.formats.map((f, i) => ({
          title: f.title,
          sku: f.sku,
          weight: f.weight || undefined,
          variant_rank: i,
          manage_inventory: !f.quote_only,
          options: { Formato: f.title },
          metadata: {
            pallets: Math.round(f.pallets * 1000000) / 1000000,
            ...(f.quote_only ? { quote_only: true } : {}),
          },
          prices: f.price === null ? [] : [{ currency_code: "eur", amount: f.price }],
        })),
      })),
    },
  })

  // Stock levels
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
  })
  const stockBySku = new Map(
    PRODUCTS.flatMap((p) => p.formats).map((f) => [f.sku, f.stock ?? 0])
  )
  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item: any) => ({
        location_id: location.id,
        inventory_item_id: item.id,
        stocked_quantity: stockBySku.get(item.sku) ?? 0,
      })),
    },
  })

  // Business price list, applied to the business group automatically
  const businessPrices = products.flatMap((product) =>
    product.variants.flatMap((v) => {
      const fmt = PRODUCTS.flatMap((p) => p.formats).find((f) => f.sku === v.sku)
      return fmt?.business_price
        ? [{ variant_id: v.id, amount: fmt.business_price, currency_code: "eur" }]
        : []
    })
  )
  await createPriceListsWorkflow(container).run({
    input: {
      price_lists_data: [
        {
          title: "Prezzi aziende",
          description: "Prezzi riservati ai clienti business",
          type: "override",
          status: "active",
          rules: { "customer.groups.id": [businessGroup.id] },
          prices: businessPrices,
        } as any,
      ],
    },
  })

  // Shop settings and delivery zones (all editable in the admin)
  logger.info("Seeding shop settings and delivery zones...")
  await settingsModule.updateSettings({
    company_name: "Tempio del Riscaldamento",
    deposit_percent: 50,
    business_group_id: businessGroup.id,
    pickup_enabled: true,
    opening_hours: "Lun-Ven 8:00-12:30, 14:00-18:00. Sab 8:00-12:30",
  })
  await zoneModule.createDeliveryZones(ZONES as any)

  logger.info("Seed complete.")
  logger.info(`Publishable API key: ${apiKey!.token}`)
  writeStorefrontKey(apiKey!.token, logger)
}

/**
 * Puts the publishable key into storefront/.env.local (created from
 * .env.template if missing), so the storefront works right after seeding.
 */
function writeStorefrontKey(token: string, logger: { info: (m: string) => void }) {
  try {
    const dir = path.resolve(process.cwd(), "..", "storefront")
    if (!fs.existsSync(dir)) return
    const envFile = path.join(dir, ".env.local")
    const template = path.join(dir, ".env.template")
    let content = fs.existsSync(envFile)
      ? fs.readFileSync(envFile, "utf8")
      : fs.existsSync(template)
        ? fs.readFileSync(template, "utf8")
        : ""
    const line = `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${token}`
    content = /^NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=.*$/m.test(content)
      ? content.replace(/^NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=.*$/m, line)
      : `${content.replace(/\s*$/, "")}\n${line}\n`
    fs.writeFileSync(envFile, content)
    logger.info(`Publishable key written to ${envFile} (restart the storefront).`)
  } catch (e) {
    logger.info(`Could not write storefront/.env.local: ${(e as Error).message}`)
  }
}
