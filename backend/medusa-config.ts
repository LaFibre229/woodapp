import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
    // Admin plugins (draft orders, cloud) and the dashboard must share one copy
    // of these packages, or their React contexts don't match.
    vite: () => ({
      resolve: {
        dedupe: [
          "react",
          "react-dom",
          "@tanstack/react-query",
          "react-router-dom",
          "react-i18next",
          "i18next",
        ],
      },
    }),
  },
  modules: [
    { resolve: "./src/modules/shop-settings" },
    { resolve: "./src/modules/delivery-zone" },
    { resolve: "./src/modules/quote-request" },
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          // Pickup at the business address and manual handling
          {
            resolve: "@medusajs/medusa/fulfillment-manual",
            id: "manual",
          },
          // Delivery priced by admin-edited zones and pallet count
          {
            resolve: "./src/modules/wood-fulfillment",
            id: "wood",
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          // Bank transfer (bonifico): order placed, money confirmed by hand
          { resolve: "./src/modules/bonifico", id: "bonifico" },
          // Stripe: cards, Apple Pay, Google Pay and PayPal (turned on in the
          // Stripe dashboard). Only loaded when a key is set, so the shop
          // still starts without one. The deposit is charged right away.
          ...(process.env.STRIPE_API_KEY
            ? [
                {
                  resolve: "@medusajs/medusa/payment-stripe",
                  id: "stripe",
                  options: {
                    apiKey: process.env.STRIPE_API_KEY,
                    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
                    capture: true,
                    automaticPaymentMethods: true,
                  },
                },
              ]
            : []),
        ],
      },
    },
  ],
})
