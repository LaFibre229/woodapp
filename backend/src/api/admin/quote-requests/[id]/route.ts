import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { QUOTE_REQUEST_MODULE } from "../../../../modules/quote-request"
import type QuoteRequestModuleService from "../../../../modules/quote-request/service"
import type { AdminUpdateQuoteRequestType } from "../../../validators"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve<QuoteRequestModuleService>(QUOTE_REQUEST_MODULE)
  res.json({ quote_request: await service.retrieveQuoteRequest(req.params.id) })
}

export const POST = async (
  req: MedusaRequest<AdminUpdateQuoteRequestType>,
  res: MedusaResponse
) => {
  const service = req.scope.resolve<QuoteRequestModuleService>(QUOTE_REQUEST_MODULE)
  const quote = await service.updateQuoteRequests({
    id: req.params.id,
    ...req.validatedBody,
  } as any)
  res.json({ quote_request: quote })
}
