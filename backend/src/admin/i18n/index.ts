/**
 * The admin dashboard is used in French. The dashboard picks its language from
 * the "lng" key (cookie or localStorage) and falls back to the browser language,
 * so French is set here as the default the first time the admin is opened.
 * Each user can still switch language in Profil > Langue.
 */
try {
  if (typeof window !== "undefined" && !window.localStorage.getItem("lng")) {
    window.localStorage.setItem("lng", "fr")
    document.cookie = "lng=fr; path=/; max-age=31536000"
    // i18n may already be initialised from the browser language: reload once
    window.location.reload()
  }
} catch {
  // Storage blocked: the dashboard keeps the browser language
}

export default {}
