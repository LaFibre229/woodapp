import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "Tempio del Riscaldamento – Legna, pellet e stufe",
    template: "%s | Tempio del Riscaldamento",
  },
  description:
    "Legna da ardere, pellet e stufe con consegna in tutta Italia, per famiglie e aziende.",
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="it" data-mode="light">
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
