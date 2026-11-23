"use client"

import { clx } from "@medusajs/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { SortOptions } from "./sort-products"

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  "data-testid"?: string
}

const SORT_OPTIONS: [SortOptions, string][] = [
  ["created_at", "Novità"],
  ["price_asc", "Prezzo crescente"],
  ["price_desc", "Prezzo decrescente"],
]

/** Sort chips shown above the product grid; scroll sideways on phones. */
const RefinementList = ({ sortBy, "data-testid": dataTestId }: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setSort = (value: SortOptions) => {
    const params = new URLSearchParams(searchParams)
    params.set("sortBy", value)
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div
      className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 small:mx-0 small:px-0"
      data-testid={dataTestId}
      role="radiogroup"
      aria-label="Ordina per"
    >
      <span className="text-[13px] text-ui-fg-muted whitespace-nowrap mr-1">Ordina per</span>
      {SORT_OPTIONS.map(([value, label]) => {
        const active = value === sortBy
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setSort(value)}
            data-testid="radio-button"
            className={clx(
              "h-9 px-4 rounded-full text-[13px] font-medium whitespace-nowrap border transition-colors",
              active
                ? "bg-bark-900 border-bark-900 text-cream-50"
                : "bg-cream-50 border-ui-border-strong text-bark-700 hover:border-bark-500"
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export default RefinementList
