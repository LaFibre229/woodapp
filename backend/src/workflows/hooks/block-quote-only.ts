import { addToCartWorkflow } from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

/**
 * Full-truck formats are quoted on request, not sold at checkout. Variants with
 * metadata.quote_only = true cannot be added to a cart.
 */
addToCartWorkflow.hooks.validate(async ({ input }, { container }) => {
  const ids = (input.items ?? []).map((i: any) => i.variant_id).filter(Boolean)
  if (!ids.length) return
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product_variant",
    fields: ["id", "title", "metadata"],
    filters: { id: ids },
  })
  const blocked = data.find((v: any) => v.metadata?.quote_only === true || v.metadata?.quote_only === "true")
  if (blocked) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Il formato "${(blocked as any).title}" è disponibile solo su preventivo.`
    )
  }
})
