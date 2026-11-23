import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { QUOTE_REQUEST_MODULE } from "../../../modules/quote-request"
import type QuoteRequestModuleService from "../../../modules/quote-request/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve<QuoteRequestModuleService>(QUOTE_REQUEST_MODULE)
  const { status, limit = "50", offset = "0" } = req.query as Record<string, string>
  const [quotes, count] = await service.listAndCountQuoteRequests(
    status ? { status: status as any } : {},
    { order: { created_at: "DESC" }, take: Number(limit), skip: Number(offset) }
  )
  res.json({ quote_requests: quotes, count, limit: Number(limit), offset: Number(offset) })
}
