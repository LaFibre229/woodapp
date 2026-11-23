import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261123111143 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "delivery_zone" ("id" text not null, "name" text not null, "description" text null, "active" boolean not null default true, "cap_rules" jsonb null, "provinces" jsonb null, "carrier" text check ("carrier" in ('own_truck', 'pallet_carrier', 'courier')) not null default 'pallet_carrier', "small_order_price" numeric not null default 0, "price_per_pallet" numeric not null default 0, "min_order_amount" numeric not null default 0, "lead_time" text null, "priority" integer not null default 0, "raw_small_order_price" jsonb not null default '{"value":"0","precision":20}', "raw_price_per_pallet" jsonb not null default '{"value":"0","precision":20}', "raw_min_order_amount" jsonb not null default '{"value":"0","precision":20}', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "delivery_zone_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_delivery_zone_deleted_at" ON "delivery_zone" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "delivery_zone" cascade;`);
  }

}
