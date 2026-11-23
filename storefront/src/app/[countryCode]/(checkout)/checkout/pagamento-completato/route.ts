import { placeOrder } from "@lib/data/cart"
import { NextRequest, NextResponse } from "next/server"

/**
 * Stripe sends the customer back here after a redirect payment method
 * (PayPal, bank redirects...). If the deposit was paid, place the order;
 * placeOrder redirects to the order confirmation.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ countryCode: string }> }
) {
  const { countryCode } = await params
  const status = req.nextUrl.searchParams.get("redirect_status")
  const back = new URL(`/${countryCode}/checkout?step=payment`, req.url)

  if (status !== "succeeded" && status !== "processing") {
    back.searchParams.set("pagamento", "non-riuscito")
    return NextResponse.redirect(back)
  }

  try {
    await placeOrder()
  } catch (e: any) {
    // redirect() from placeOrder throws a special error that Next handles
    if (e?.digest?.startsWith?.("NEXT_REDIRECT")) throw e
    back.searchParams.set("pagamento", "errore")
    return NextResponse.redirect(back)
  }
  return NextResponse.redirect(back)
}
