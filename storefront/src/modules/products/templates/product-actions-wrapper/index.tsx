import { retrieveCustomer } from "@lib/data/customer"
import { listProducts } from "@lib/data/products"
import { isBusinessCustomer } from "@lib/util/variant"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Fetches real time pricing for a product (business prices when the customer
 * signed up as a business) and renders the product actions.
 */
export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  const [product, customer] = await Promise.all([
    listProducts({
      queryParams: { id: [id] },
      regionId: region.id,
    }).then(({ response }) => response.products[0]),
    retrieveCustomer(),
  ])

  if (!product) {
    return null
  }

  return (
    <ProductActions
      product={product}
      region={region}
      isBusiness={isBusinessCustomer(customer)}
      customer={customer}
    />
  )
}
