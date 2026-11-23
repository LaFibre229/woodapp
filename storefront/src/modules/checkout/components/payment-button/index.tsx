"use client"

import { isBonifico, isManual, isStripeLike } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import { useParams } from "next/navigation"
import React, { useState } from "react"
import ErrorMessage from "../error-message"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  switch (true) {
    case isStripeLike(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
    case isBonifico(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    default:
      return <Button disabled>Scegli un metodo di pagamento</Button>
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { countryCode } = useParams<{ countryCode: string }>()

  const stripe = useStripe()
  const elements = useElements()

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements

  const handlePayment = async () => {
    if (!stripe || !elements || !session) return
    setSubmitting(true)
    setErrorMessage(null)

    const address = cart.billing_address
    // Cards confirm in place; PayPal and other redirect methods come back to
    // the return page, which places the order.
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret: session.data.client_secret as string,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}/${countryCode}/checkout/pagamento-completato`,
        payment_method_data: {
          billing_details: {
            name: [address?.first_name, address?.last_name].filter(Boolean).join(" "),
            email: cart.email ?? undefined,
            phone: address?.phone ?? undefined,
            address: {
              city: address?.city ?? undefined,
              country: address?.country_code ?? undefined,
              line1: address?.address_1 ?? undefined,
              line2: address?.address_2 ?? undefined,
              postal_code: address?.postal_code ?? undefined,
              state: address?.province ?? undefined,
            },
          },
        },
      },
    })

    const pi = paymentIntent ?? error?.payment_intent
    if (pi && ["succeeded", "requires_capture", "processing"].includes(pi.status)) {
      await placeOrder()
        .catch((err) => setErrorMessage(err.message))
        .finally(() => setSubmitting(false))
      return
    }

    setErrorMessage(error?.message ?? "Pagamento non riuscito. Riprova.")
    setSubmitting(false)
  }

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        Paga l&apos;acconto e conferma
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)

    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid="submit-order-button"
      >
        Conferma ordine
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
