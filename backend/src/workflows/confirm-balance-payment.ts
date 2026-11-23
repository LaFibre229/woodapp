import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  addOrderTransactionStep,
  authorizePaymentSessionStep,
} from "@medusajs/medusa/core-flows"

type Input = { order_id: string; payment_session_id: string }

/**
 * Confirms the balance (saldo) payment after the customer paid it on the
 * storefront: asks the provider for the payment status, records the payment
 * (Stripe charges right away, so it is captured) and adds the capture to the
 * order's transactions so the order shows as paid. Safe to run twice, and
 * safe to run after Stripe's webhook already did the same.
 */
export const confirmBalancePaymentWorkflow = createWorkflow(
  "confirm-balance-payment",
  (input: Input) => {
    const payment = authorizePaymentSessionStep({ id: input.payment_session_id, context: {} })

    const transactions = transform({ payment, input }, ({ payment, input }) =>
      ((payment as any)?.captures ?? []).map((capture: any) => ({
        order_id: input.order_id,
        amount: capture.raw_amount ?? capture.amount,
        currency_code: (payment as any).currency_code,
        reference: "capture",
        reference_id: capture.id,
      }))
    )
    addOrderTransactionStep(transactions)

    return new WorkflowResponse(payment)
  }
)
