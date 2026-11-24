"use client"

import { Heading, Text, clx } from "@medusajs/ui"

import PaymentButton from "../payment-button"
import DepositSummary, { DepositInfo } from "@modules/shop/components/deposit-summary"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useSearchParams } from "next/navigation"

const Review = ({
  cart,
  deposit,
  companyName,
}: {
  cart: any
  deposit?: DepositInfo | null
  companyName?: string
}) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard)

  return (
    <div className="bg-ui-bg-base">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          Conferma
        </Heading>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          {deposit && (
            <div className="mb-6">
              <DepositSummary deposit={deposit} currencyCode={cart.currency_code} />
            </div>
          )}
          <div className="flex items-start gap-x-1 w-full mb-6">
            <div className="w-full">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Confermando l&apos;ordine dichiari di aver letto e accettato le{" "}
                <LocalizedClientLink href="/condizioni-di-vendita" className="underline">
                  condizioni di vendita
                </LocalizedClientLink>{" "}
                e l&apos;informativa sulla privacy di {companyName ?? "questo negozio"}.
              </Text>
            </div>
          </div>
          <PaymentButton cart={cart} data-testid="submit-order-button" />
        </>
      )}
    </div>
  )
}

export default Review
