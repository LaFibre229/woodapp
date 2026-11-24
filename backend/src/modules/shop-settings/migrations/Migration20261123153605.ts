import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261123153605 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "shop_settings" add column if not exists "bank_beneficiary" text null, add column if not exists "bank_iban" text null, add column if not exists "bank_bic" text null, add column if not exists "bank_name" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "shop_settings" drop column if exists "bank_beneficiary", drop column if exists "bank_iban", drop column if exists "bank_bic", drop column if exists "bank_name";`);
  }

}
