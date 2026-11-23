import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261123111147 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "quote_request" ("id" text not null, "status" text check ("status" in ('new', 'contacted', 'quoted', 'won', 'lost')) not null default 'new', "customer_type" text check ("customer_type" in ('private', 'business')) not null default 'business', "company_name" text null, "vat_number" text null, "first_name" text not null, "last_name" text null, "email" text not null, "phone" text null, "postal_code" text not null, "city" text null, "province" text null, "product_id" text null, "variant_id" text null, "product_title" text null, "quantity" text null, "desired_date" text null, "message" text null, "customer_id" text null, "admin_notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "quote_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_quote_request_deleted_at" ON "quote_request" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "quote_request" cascade;`);
  }

}
