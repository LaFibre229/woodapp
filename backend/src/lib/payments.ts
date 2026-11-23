import crypto from "crypto"
import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import {
  computeDeposit,
  depositPercentFor,
  getBusinessGroupId,
  getShopSettings,
  isBusinessCustomer,
} from "./settings"
import { toNumber } from "./zones"

export const STRIPE_PROVIDER_ID = "pp_stripe_stripe"
export const BONIFICO_PROVIDER_ID = "pp_bonifico_bonifico"
export const SYSTEM_PROVIDER_ID = "pp_system_default"

const sameAmount = (a: unknown, b: unknown) =>
  Math.abs(toNumber(a) - toNumber(b)) < 0.005

/**
 * Deposit (acconto) due now for a cart and balance (saldo) due later. A cart
 * counts as business when the customer is in the business group, or when the
 * checkout invoice step marked it as business (cart.metadata.customer_type),
 * the same rule the order-deposit subscriber applies to the placed order.
 */
export const cartDeposit = async (container: MedusaContainer, cartId: string) => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "total",
      "currency_code",
      "metadata",
      "customer.metadata",
      "customer.groups.id",
      "payment_collection.id",
      "payment_collection.payment_sessions.*",
    ],
    filters: { id: cartId },
  })
  const cart = data[0] as any
  if (!cart) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Carrello non trovato")
  }
  const settings = await getShopSettings(container)
  const business =
    !!isBusinessCustomer(cart.customer, await getBusinessGroupId(container)) ||
    cart.metadata?.customer_type === "business"
  return {
    cart,
    business,
    deposit: computeDeposit(toNumber(cart.total), depositPercentFor(settings, business)),
  }
}

/**
 * Sets the cart's pending payment session to the deposit amount, so only the
 * deposit is charged when the order is placed. For Stripe this updates the
 * PaymentIntent amount before the customer confirms.
 */
export const applyDepositToSession = async (container: MedusaContainer, cartId: string) => {
  const { cart, deposit } = await cartDeposit(container, cartId)
  const session = (cart.payment_collection?.payment_sessions ?? []).find(
    (s: any) => s.status === "pending"
  )
  if (!session) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Nessuna sessione di pagamento attiva")
  }
  if (!sameAmount(session.amount, deposit.deposit_amount)) {
    const payment = container.resolve(Modules.PAYMENT)
    await payment.updatePaymentSession({
      id: session.id,
      data: session.data ?? {},
      amount: deposit.deposit_amount,
      currency_code: cart.currency_code,
      context: session.context ?? {},
    })
  }
  return deposit
}

/** Throws when the session to authorize does not match the current deposit. */
export const assertSessionMatchesDeposit = async (container: MedusaContainer, cartId: string) => {
  const { cart, deposit } = await cartDeposit(container, cartId)
  const sessions = (cart.payment_collection?.payment_sessions ?? []).filter((s: any) =>
    ["pending", "requires_more", "authorized", "captured", "pending_authorization"].includes(s.status)
  )
  // Nothing to pay (e.g. fully discounted): Medusa skips payment itself
  if (!sessions.length || deposit.total <= 0) return
  const session = sessions[0]
  if (!sameAmount(session.amount, deposit.deposit_amount)) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "L'importo dell'acconto non è aggiornato. Torna al passaggio Pagamento e riprova."
    )
  }
}

/* ------------------------------------------------------------------------ */
/* Balance (saldo)                                                           */
/* ------------------------------------------------------------------------ */

const ORDER_PAYMENT_FIELDS = [
  "id",
  "display_id",
  "email",
  "currency_code",
  "total",
  "metadata",
  "payment_collections.id",
  "payment_collections.status",
  "payment_collections.amount",
  "payment_collections.captured_amount",
  "payment_collections.created_at",
  "payment_collections.payment_sessions.*",
  "payment_collections.payments.id",
  "payment_collections.payments.provider_id",
  "payment_collections.payments.amount",
  "payment_collections.payments.captured_at",
  "payment_collections.payments.canceled_at",
]

export const getOrderPayments = async (container: MedusaContainer, orderId: string) => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "order",
    fields: ORDER_PAYMENT_FIELDS,
    filters: { id: orderId },
  })
  const order = data[0] as any
  if (!order) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Ordine non trovato")
  }
  return order
}

type PaymentState = "none" | "awaiting" | "authorized" | "paid" | "canceled"

const collectionState = (pc: any): PaymentState => {
  if (!pc) return "none"
  const payments = (pc.payments ?? []).filter((p: any) => !p.canceled_at)
  if (payments.some((p: any) => p.captured_at) || pc.status === "completed") return "paid"
  if (payments.length || pc.status === "authorized") return "authorized"
  if (pc.status === "canceled") return "canceled"
  return "awaiting"
}

/**
 * The deposit is the cart's payment collection (the first one); the balance
 * is the collection created by "request balance", whose id is kept in the
 * order metadata.
 */
export const paymentSummary = (order: any) => {
  const meta = order.metadata ?? {}
  const collections = [...(order.payment_collections ?? [])].sort(
    (a, b) => +new Date(a.created_at) - +new Date(b.created_at)
  )
  const balancePc = collections.find((pc) => pc.id === meta.balance_payment_collection_id)
  const depositPc = collections.find((pc) => pc.id !== meta.balance_payment_collection_id)
  const depositPayment = (depositPc?.payments ?? []).find((p: any) => !p.canceled_at)
  const balancePayment = (balancePc?.payments ?? []).find((p: any) => !p.canceled_at)
  return {
    deposit: {
      amount: toNumber(meta.deposit_amount ?? depositPc?.amount),
      state: collectionState(depositPc),
      provider_id: depositPayment?.provider_id ?? null,
    },
    balance: {
      amount: toNumber(meta.balance_amount),
      state: balancePc ? collectionState(balancePc) : "none",
      provider_id: balancePayment?.provider_id ?? null,
      payment_collection_id: balancePc?.id ?? null,
      requested_at: meta.balance_requested_at ?? null,
    },
    balancePc,
  }
}

export const newBalanceToken = () => crypto.randomBytes(24).toString("base64url")

/** Constant-time check of the token in a balance payment link. */
export const checkBalanceToken = (order: any, token: unknown) => {
  const expected = order.metadata?.balance_token
  if (
    typeof expected !== "string" ||
    typeof token !== "string" ||
    expected.length !== token.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token))
  ) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Link di pagamento non valido")
  }
}

export const balancePayUrl = (order: any) => {
  const base = (process.env.STOREFRONT_URL || "http://localhost:8000").replace(/\/$/, "")
  return `${base}/it/saldo/${order.id}?t=${order.metadata?.balance_token}`
}

/** Providers enabled for the Italy region (bank transfer only with an IBAN). */
export const enabledBalanceProviders = async (container: MedusaContainer) => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "payment_provider",
    fields: ["id", "is_enabled"],
  })
  const ids = new Set((data as any[]).filter((p) => p.is_enabled !== false).map((p) => p.id))
  const settings = await getShopSettings(container)
  return [
    ...(ids.has(STRIPE_PROVIDER_ID) ? [STRIPE_PROVIDER_ID] : []),
    ...(ids.has(BONIFICO_PROVIDER_ID) && settings.bank_iban ? [BONIFICO_PROVIDER_ID] : []),
  ]
}
