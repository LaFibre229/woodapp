"use client"

import { useActionState, useState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"
import { clx } from "@medusajs/ui"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

/**
 * Sign-up for households and businesses. A business account gets business
 * prices right after sign-up (no manual approval).
 */
const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)
  const [type, setType] = useState<"private" | "business">("private")

  return (
    <div className="max-w-sm flex flex-col items-center" data-testid="register-page">
      <h1 className="text-large-semi uppercase mb-6">Crea il tuo account</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        Ordina più velocemente e segui le tue consegne. Le aziende vedono subito i prezzi
        riservati.
      </p>
      <form className="w-full flex flex-col" action={formAction}>
        <input type="hidden" name="customer_type" value={type} />
        <div className="flex gap-2 mb-4 text-small-regular" role="radiogroup">
          {(["private", "business"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={type === t}
              onClick={() => setType(t)}
              data-testid={`register-type-${t}`}
              className={clx(
                "flex-1 h-10 border rounded-rounded",
                type === t ? "border-ui-border-interactive" : "border-ui-border-base"
              )}
            >
              {t === "private" ? "Privato" : "Azienda"}
            </button>
          ))}
        </div>
        <div className="flex flex-col w-full gap-y-2">
          {type === "business" && (
            <>
              <Input
                label="Ragione sociale"
                name="company_name"
                required
                autoComplete="organization"
                data-testid="company-name-input"
              />
              <Input label="Partita IVA" name="vat_number" required data-testid="vat-input" />
              <Input label="Codice SDI" name="sdi_code" maxLength={7} />
              <Input label="PEC" name="pec" type="email" />
            </>
          )}
          <Input
            label="Nome"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Cognome"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          {type === "private" && (
            <Input label="Codice fiscale" name="tax_code" maxLength={16} />
          )}
          <Input
            label="Email"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Telefono"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Password"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          Creando un account accetti le{" "}
          <LocalizedClientLink href="/condizioni-di-vendita" className="underline">
            condizioni di vendita
          </LocalizedClientLink>{" "}
          e l&apos;
          <LocalizedClientLink href="/privacy" className="underline">
            informativa sulla privacy
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          Registrati
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Hai già un account?{" "}
        <button onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)} className="underline">
          Accedi
        </button>
        .
      </span>
    </div>
  )
}

export default Register
