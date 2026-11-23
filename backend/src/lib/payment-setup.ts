import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Enables the installed payment providers on the Italy region. The system
 * provider (test payment) is kept so local checkouts work without Stripe; the
 * storefront hides it once a Stripe key is set.
 */
export const linkPaymentProviders = async (
  container: MedusaContainer,
  updateRegionsWorkflow: any
): Promise<string[]> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: providers } = await query.graph({
    entity: "payment_provider",
    fields: ["id", "is_enabled"],
  })
  const wanted = ["pp_system_default", "pp_bonifico_bonifico", "pp_stripe_stripe"]
  const ids = wanted.filter((id) =>
    (providers as any[]).some((p) => p.id === id && p.is_enabled !== false)
  )
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "countries.iso_2"],
  })
  const italy = (regions as any[]).filter((r) =>
    (r.countries ?? []).some((c: any) => c?.iso_2 === "it")
  )
  for (const region of italy) {
    await updateRegionsWorkflow(container).run({
      input: { selector: { id: region.id }, update: { payment_providers: ids } },
    })
  }
  return ids
}
