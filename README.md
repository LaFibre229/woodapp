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
pnpm db:up                       # starts Postgres + Redis in Docker (creates the wood_shop database)

# Backend
cd backend
cp .env.template .env            # already points at the Docker services
npx medusa db:migrate
pnpm seed                        # demo catalogue, zones, settings; prints the publishable key
npx medusa user -e admin@example.com -p supersecret
pnpm dev                         # http://localhost:9000/app

# Storefront (another terminal; needs the backend running, also for `pnpm build`)
cd storefront
cp .env.template .env.local      # paste the publishable key from the seed
pnpm dev                         # http://localhost:8000/it
```

Database: `pnpm db:down` stops the containers (data is kept in a Docker
volume), `pnpm db:reset` wipes and recreates the database (then migrate and seed
again). If ports 5432 or 6379 are taken, set `POSTGRES_PORT` / `REDIS_PORT`
before `pnpm db:up` and adjust `DATABASE_URL` / `REDIS_URL` in `backend/.env`.

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
charge of the deposit and balance comes with the payments layer; until then the
built-in test payment provider is used.

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

## Not built yet (later layers)

- Payments: Stripe (cards), PayPal, bank transfer, then Satispay and instalments;
  charging the deposit, then the balance.
- E-invoicing service (SdI) once the company and VAT number exist.
- Branding: name, logo, colours, photos and copy. The UI is the starter's
  neutral look for now.
- Deployment: hosting, domain, email, legal pages (placeholders exist at
  `/condizioni-di-vendita` and `/privacy`), live payments. Use the Redis event
  bus and cache modules in production.

## Admin language

The admin opens in French by default (set on first visit). Each user can switch
in Profil > Langue.
