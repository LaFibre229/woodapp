import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { QUOTE_REQUEST_MODULE } from "../../../modules/quote-request"
import type QuoteRequestModuleService from "../../../modules/quote-request/service"
import type { StoreCreateQuoteRequestType } from "../../validators"

/** Truck order / large order request ("Richiedi un preventivo"). */
export const POST = async (
  req: MedusaRequest<StoreCreateQuoteRequestType>,
  res: MedusaResponse
) => {
  const service = req.scope.resolve<QuoteRequestModuleService>(QUOTE_REQUEST_MODULE)
  const customerId = (req as any).auth_context?.actor_id ?? null
  const quote = await service.createQuoteRequests({
    ...req.validatedBody,
    customer_id: customerId,
  } as any)
  res.status(201).json({ quote_request: { id: quote.id, status: quote.status } })
}
