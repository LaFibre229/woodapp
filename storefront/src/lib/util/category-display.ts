/** Order and short blurbs for the main categories, used by home, catalogue and footer. */
export const CATEGORY_ORDER = ["legna-da-ardere", "pellet", "stufe"]

export const CATEGORY_COPY: Record<string, string> = {
  "legna-da-ardere":
    "Faggio e quercia stagionati almeno 18 mesi, anche in pezzatura per forni a legna.",
  pellet: "Abete e faggio certificati ENplus A1, in sacchi da 15 kg o a bancale.",
  stufe: "Stufe a legna e a pellet per scaldare casa con efficienza.",
}

export const sortCategories = <T extends { handle: string }>(categories: T[]) => {
  const rank = (handle: string) =>
    CATEGORY_ORDER.indexOf(handle) + 1 || CATEGORY_ORDER.length + 1
  return [...categories].sort((a, b) => rank(a.handle) - rank(b.handle))
}
