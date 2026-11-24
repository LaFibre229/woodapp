"use client"

import { confirmBalancePayment, startBalancePayment } from "@lib/data/shop"
import { Button, Text } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useRouter } from "next/navigation"
import { useState } from "react"

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

/** Pays the balance with Stripe (card, PayPal, Apple Pay, Google Pay). */
export default function BalancePayment({
  orderId,
  token,
  amountLabel,
  clientSecret: initialSecret,
}: {
  orderId: string
  token: string
  amountLabel: string
  clientSecret: string | null
}) {
  const [clientSecret, setClientSecret] = useState(initialSecret)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!stripePromise) return null

  if (!clientSecret) {
    return (
      <div className="flex flex-col gap-y-2">
        <Button
          size="large"
          isLoading={loading}
          onClick={async () => {
            setLoading(true)
            setError(null)
            const res = await startBalancePayment(orderId, token)
            if (res.session?.client_secret) setClientSecret(res.session.client_secret)
            else setError(res.error ?? "Pagamento non disponibile")
            setLoading(false)
          }}
          data-testid="start-balance-payment"
        >
          Paga {amountLabel} con carta o PayPal
        </Button>
        <ErrorMessage error={error} data-testid="balance-start-error" />
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, locale: "it" }}>
      <BalanceForm orderId={orderId} token={token} amountLabel={amountLabel} />
    </Elements>
  )
}

const BalanceForm = ({
  orderId,
  token,
  amountLabel,
}: {
  orderId: string
  token: string
  amountLabel: string
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [complete, setComplete] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pay = async () => {
    if (!stripe || !elements) return
    setSubmitting(true)
    setError(null)
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        // Redirect methods come back to this page, which records the payment
        return_url: window.location.href,
      },
    })
    if (paymentIntent && ["succeeded", "processing"].includes(paymentIntent.status)) {
      const res = await confirmBalancePayment(orderId, token)
      if (res.error) setError(res.error)
      router.refresh()
    } else {
      setError(error?.message ?? "Pagamento non riuscito. Riprova.")
    }
    setSubmitting(false)
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Text className="txt-medium-plus">Paga con carta, PayPal, Apple Pay o Google Pay</Text>
      <PaymentElement options={{ layout: "tabs" }} onChange={(e) => setComplete(e.complete)} />
      <Button
        size="large"
        disabled={!stripe || !complete}
        isLoading={submitting}
        onClick={pay}
        data-testid="pay-balance-button"
      >
        Paga {amountLabel}
      </Button>
      <ErrorMessage error={error} data-testid="balance-payment-error" />
    </div>
  )
}
