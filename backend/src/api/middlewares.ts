import {
  authenticate,
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import {
  AdminCreateDeliveryZone,
  AdminUpdateDeliveryZone,
  AdminUpdateQuoteRequest,
  AdminMarkPaid,
  AdminUpdateShopSettings,
  StoreBalanceComplete,
  StoreBalanceSession,
  StoreCreateQuoteRequest,
} from "./validators"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/quote-requests",
      method: "POST",
      middlewares: [
        // Logged-in customers are linked to their request; guests are allowed
        authenticate("customer", ["session", "bearer"], { allowUnauthenticated: true }),
        validateAndTransformBody(StoreCreateQuoteRequest),
      ],
    },
    {
      matcher: "/admin/shop-settings",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminUpdateShopSettings)],
    },
    {
      matcher: "/admin/delivery-zones",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminCreateDeliveryZone)],
    },
    {
      matcher: "/admin/delivery-zones/:id",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminUpdateDeliveryZone)],
    },
    {
      matcher: "/admin/quote-requests/:id",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminUpdateQuoteRequest)],
    },
    {
      matcher: "/store/balance/:id/session",
      method: "POST",
      middlewares: [validateAndTransformBody(StoreBalanceSession)],
    },
    {
      matcher: "/store/balance/:id/complete",
      method: "POST",
      middlewares: [validateAndTransformBody(StoreBalanceComplete)],
    },
    {
      matcher: "/admin/order-payments/:id/mark-paid",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminMarkPaid)],
    },
  ],
})
