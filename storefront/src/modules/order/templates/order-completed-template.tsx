import { Heading } from "@medusajs/ui"

import { getShopSettings } from "@lib/data/shop"
import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import DepositSummary from "@modules/shop/components/deposit-summary"
import { HttpTypes } from "@medusajs/types"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

/** Deposit stored on the order, or computed from the shop settings while it is saved. */
export const orderDeposit = async (order: HttpTypes.StoreOrder) => {
  const meta = (order.metadata ?? {}) as Record<string, any>
  if (meta.deposit_amount !== undefined) {
    return {
      percent: Number(meta.deposit_percent),
      deposit_amount: Number(meta.deposit_amount),
      balance_amount: Number(meta.balance_amount),
    }
  }
  const settings = await getShopSettings()
  const percent =
    meta.customer_type === "business" && settings.business_deposit_percent !== null
      ? settings.business_deposit_percent
      : settings.deposit_percent
  const deposit = Math.round(order.total * percent) / 100
  return {
    percent,
    deposit_amount: deposit,
    balance_amount: Math.round((order.total - deposit) * 100) / 100,
  }
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const deposit = await orderDeposit(order)

  return (
    <div className="py-6 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        <div
          className="flex flex-col gap-4 max-w-4xl h-full bg-white w-full py-10"
          data-testid="order-complete-container"
        >
          <Heading
            level="h1"
            className="flex flex-col gap-y-3 text-ui-fg-base text-3xl mb-4"
          >
            <span>Grazie!</span>
            <span>Il tuo ordine è stato registrato.</span>
          </Heading>
          <OrderDetails order={order} />
          <Heading level="h2" className="flex flex-row text-3xl-regular">
            Riepilogo
          </Heading>
          <Items order={order} />
          <CartTotals totals={order} />
          <DepositSummary deposit={deposit} currencyCode={order.currency_code} paid />
          <ShippingDetails order={order} />
          <PaymentDetails order={order} />
          <Help />
        </div>
      </div>
    </div>
  )
}
