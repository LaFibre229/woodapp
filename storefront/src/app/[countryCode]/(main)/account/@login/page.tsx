import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Accedi",
  description: "Accedi al tuo account.",
}

export default function Login() {
  return <LoginTemplate />
}
