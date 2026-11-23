import Medusa from "@medusajs/js-sdk"

export const sdk = new Medusa({
  baseUrl: import.meta.env.VITE_BACKEND_URL || "/",
  debug: import.meta.env.DEV,
  auth: { type: "session" },
})

export const euro = (value: unknown) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    Number(value ?? 0)
  )

export const num = (value: unknown) => {
  if (value === null || value === undefined || value === "") return 0
  if (typeof value === "object" && value && "value" in (value as any)) {
    return Number((value as any).value) || 0
  }
  return Number(value) || 0
}
