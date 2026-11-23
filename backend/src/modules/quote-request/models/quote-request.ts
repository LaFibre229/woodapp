import { model } from "@medusajs/framework/utils"

/** A "truck order" or large order request that the shop answers with a quote. */
const QuoteRequest = model.define("quote_request", {
  id: model.id({ prefix: "quote" }).primaryKey(),
  status: model.enum(["new", "contacted", "quoted", "won", "lost"]).default("new"),
  customer_type: model.enum(["private", "business"]).default("business"),
  company_name: model.text().nullable(),
  vat_number: model.text().nullable(),
  first_name: model.text(),
  last_name: model.text().nullable(),
  email: model.text(),
  phone: model.text().nullable(),
  postal_code: model.text(),
  city: model.text().nullable(),
  province: model.text().nullable(),
  product_id: model.text().nullable(),
  variant_id: model.text().nullable(),
  product_title: model.text().nullable(),
  quantity: model.text().nullable(),
  desired_date: model.text().nullable(),
  message: model.text().nullable(),
  customer_id: model.text().nullable(),
  admin_notes: model.text().nullable(),
})

export default QuoteRequest
