import {
  authenticate,
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import {
  AdminCreateDeliveryZone,
  AdminUpdateDeliveryZone,
  AdminUpdateQuoteRequest,
  AdminUpdateShopSettings,
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
  ],
})
