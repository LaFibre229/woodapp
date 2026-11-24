import { Text, clx } from "@medusajs/ui"
import { VariantPrice } from "types/global"

export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  return (
    <>
      {price.price_type === "sale" && (
        <Text
          className="line-through text-ui-fg-muted txt-small"
          data-testid="original-price"
        >
          {price.original_price}
        </Text>
      )}
      <Text
        className={clx("text-bark-800 txt-medium", {
          "text-ember-600": price.price_type === "sale",
        })}
        data-testid="price"
      >
        <span className="text-ui-fg-muted txt-small">da </span>
        <span className="font-semibold">{price.calculated_price}</span>
      </Text>
    </>
  )
}
