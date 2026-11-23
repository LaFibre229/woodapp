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
    // Payment providers (Stripe, PayPal, bank transfer) are added in the
    // payments layer. Until then the built-in system provider is used.
  ],
})
