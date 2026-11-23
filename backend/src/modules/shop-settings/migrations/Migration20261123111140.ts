import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261123111140 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "shop_settings" ("id" text not null, "company_name" text not null default 'Tempio del Riscaldamento', "legal_form" text null, "vat_number" text null, "tax_code" text null, "rea_number" text null, "share_capital" text null, "pec" text null, "sdi_code" text null, "email" text null, "phone" text null, "whatsapp" text null, "address_line" text null, "postal_code" text null, "city" text null, "province" text null, "opening_hours" text null, "pickup_enabled" boolean not null default true, "pickup_address" text null, "pickup_notes" text null, "deposit_percent" integer not null default 50, "business_deposit_percent" integer null, "business_group_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "shop_settings_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shop_settings_deleted_at" ON "shop_settings" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "shop_settings" cascade;`);
  }

}
