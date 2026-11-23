# Tempio del Riscaldamento – wood shop

E-commerce for firewood, pellets and stoves across Italy, for households and
businesses.

| Part | Stack | Language | Port |
| --- | --- | --- | --- |
| `backend/` | Medusa 2.23 + PostgreSQL (+ Redis) | Admin dashboard in French | 9000 (`/app` for the admin) |
| `storefront/` | Next.js 15 (Medusa starter) | Italian only | 8000 |

## Run locally

Requirements: Node 20+, pnpm 10 and Docker (for PostgreSQL 16 and Redis 7, see
`docker-compose.yml`). The repo is a pnpm workspace: one `pnpm install` at the
root installs both apps.

```bash
pnpm install                     # both apps, from the repo root
pnpm db:up                       # starts Postgres (port 5433) + Redis (6379) in Docker, creates wood_shop

# Backend
cd backend
cp .env.template .env            # already points at the Docker services (Windows: copy .env.template .env)
npx medusa db:migrate
pnpm seed                        # demo catalogue, zones, settings; writes the publishable key to storefront/.env.local
npx medusa user -e admin@example.com -p supersecret
pnpm dev                         # http://localhost:9000/app

# Storefront (another terminal; needs the backend running, also for `pnpm build`)
cd storefront
pnpm dev                         # http://localhost:8000/it
```

The storefront needs `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` in `storefront/.env.local`.
`pnpm seed` writes it there (creating the file from `.env.template`). If you see
"A valid publishable key is required", copy the key from Admin > Paramètres >
Clés API publiables into that variable and restart the storefront.

Database: `pnpm db:down` stops the containers (data is kept in a Docker
volume), `pnpm db:reset` wipes and recreates the database (then migrate and seed
again). Postgres uses host port 5433 so it does not clash with a Postgres installed
on the machine. If ports 5433 or 6379 are taken, set `POSTGRES_PORT` / `REDIS_PORT`
before `pnpm db:up` and adjust `DATABASE_URL` / `REDIS_URL` in `backend/.env`.

Troubleshooting `database "wood_shop" does not exist`: the backend reached a
different Postgres than the Docker one (usually a local install on 5432). Check
that `DATABASE_URL` in `backend/.env` uses port 5433 and that `docker compose ps`
shows `postgres` as healthy. If the volume was created by an older setup, run
`pnpm db:reset`.

From the root you can also run `pnpm dev:backend`, `pnpm dev:storefront`,
`pnpm seed` and `pnpm test` (unit tests for zone matching, pallet pricing and
the deposit).

`.npmrc` sets `shamefully-hoist=true`: Medusa loads its modules and admin
extensions by package name at runtime, so packages must also be reachable from
the root `node_modules`. Both apps use the same React version (19.3.1, the one
the Medusa 2.23 admin ships with) so only one copy is installed.

## What is built (layer 2: development)

**Catalogue.** Each product has one variant per format (sack, half pallet,
pallet, full truck). Variant metadata holds `pallets` (share of a pallet per
unit, used for delivery pricing) and `quote_only` (full trucks: not sold in the
cart, the product page shows a quote form instead). Both are editable in the
admin on the product page ("Formats et livraison").

**VAT.** Italy region with tax-inclusive prices. Default rate 22%, a 10% rate
for the product type "Legna da ardere". To confirm with the accountant.

**Business customers.** Sign-up has a Privato / Azienda choice. A business
(company name, P.IVA, SDI or PEC) is added to the "Aziende" customer group on
sign-up, with no manual check, and the "Prezzi aziende" price list applies
right away. Businesses see prices VAT excluded.

**Deposit (acconto).** Percentage set in Admin > Paramètres > Société et acompte (50% by
default, optional different rate for businesses). Shown in the cart, checkout
and order confirmation, and stored on each order (`metadata.deposit_amount`,
`balance_amount`). The admin order page shows "Acompte et solde". The actual
charge of the deposit and balance is described under "Payments" below.

**Delivery zones.** Admin > Zones de livraison: zones by CAP prefix or range
(`20`, `20000-20999`, `*`) or province, with price under one pallet, price per
started pallet, minimum order, lead time, carrier. Seeded with five zones
covering all of Italy. Checkout prices home delivery from these zones
(custom fulfillment provider `wood-delivery`) and refuses addresses outside
them with a message suggesting pickup. Product pages have a "Consegnate da me?"
CAP check with an estimate.

**Pickup.** "Ritiro in sede" is free; the address shown is the business
address from the shop settings (or a separate pickup address).

**Shop settings.** Company name, legal form, P.IVA, codice fiscale, REA, PEC,
SDI, address, contacts, hours: all editable in the admin, read by the footer,
contact page and checkout. Empty until the company exists.

**Quote requests.** "Preventivo camion" page and the truck format on product
pages create requests listed in Admin > Demandes de devis, with status and notes.

**Invoice details.** Checkout asks for codice fiscale (households) or company
name, P.IVA and SDI code or PEC (businesses), validated and saved on the order
for the e-invoicing service later.

## Payments (layer 3)

**Methods.** Stripe (cards, Apple Pay, Google Pay, and PayPal or Klarna once
turned on in the Stripe dashboard) and bank transfer (bonifico). Everything
runs in Stripe test mode until the company exists; no P.IVA is needed for that.

**Deposit at checkout.** Only the deposit is charged when the order is placed:
the payment session is set to the deposit amount, and checkout refuses an
order whose session no longer matches the deposit. With Stripe the deposit is
charged right away. With bonifico the order is placed, the confirmation page
shows the IBAN and the reference ("Acconto ordine n. X"), and the admin
clicks "Marquer comme reçu" in the "Acompte et solde" box when the money
arrives.

**Balance before delivery.** In the order's "Acompte et solde" box, "Demander le
solde" creates a payment link (`/it/saldo/<order>?t=<token>`) to send to the
customer. The page lets them pay by card/PayPal through Stripe, or shows the
bank details with the reference "Saldo ordine n. X". Cash at pickup or a
transfer is recorded with "Marquer comme reçu". (Use this link, not Medusa's
own "Copier le lien de paiement" button above it.)

**Bank details.** Admin > Paramètres > Société et acompte > Virement bancaire:
beneficiary, IBAN, BIC, bank. All empty by default; bank transfer is offered to
customers only once the IBAN is filled in.

**Without Stripe keys** the checkout offers the test payment ("Pagamento di
prova") and bank transfer, so everything else can be tried locally.

### Turning on Stripe test mode (Windows)

1. Create a free account at https://dashboard.stripe.com/register (an email is
   enough) and stay in **Test mode**.
2. Developers > API keys: copy the **Secret key** (`sk_test_...`) into
   `backend\.env` as `STRIPE_API_KEY=`, and the **Publishable key**
   (`pk_test_...`) into `storefront\.env.local` as `NEXT_PUBLIC_STRIPE_KEY=`.
3. Optional: Settings > Payment methods, turn on PayPal (and Apple Pay /
   Google Pay, Klarna) in test mode.
4. In PowerShell, from the repo root:
   ```powershell
   pnpm --filter wood-shop-backend exec medusa db:migrate   # adds the bank fields
   pnpm payments:setup                                       # enables Stripe + bonifico on Italy
   ```
   then restart `pnpm dev` in `backend` and in `storefront`.
5. Pay with the test card `4242 4242 4242 4242`, any future date, any CVC.
   `4000 0027 6000 3184` tests the 3-D Secure popup.

Webhooks are optional locally: checkout and the balance page confirm the
payment themselves. To receive them anyway, install the Stripe CLI
(`winget install Stripe.StripeCLI`), run
`stripe listen --forward-to localhost:9000/hooks/payment/stripe_stripe`, and put
the `whsec_...` it prints in `STRIPE_WEBHOOK_SECRET`. In production, add the
same URL as an endpoint in the Stripe dashboard.

## Not built yet (later layers)

- Payments: Satispay and instalments; sending the balance link by email
  (needs the email provider from the deployment layer).
- E-invoicing service (SdI) once the company and VAT number exist.
- Branding: name, logo, colours, photos and copy. The UI is the starter's
  neutral look for now.
- Deployment: hosting, domain, email, legal pages (placeholders exist at
  `/condizioni-di-vendita` and `/privacy`), live payments. Use the Redis event
  bus and cache modules in production.

## Admin language

The admin opens in French by default (set on first visit). Each user can switch
in Profil > Langue.
