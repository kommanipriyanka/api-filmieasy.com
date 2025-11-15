CREATE TYPE "public"."currency_type" AS ENUM('INR', 'DOLLARS');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('BANK', 'UPI', 'CASH');--> statement-breakpoint
CREATE TYPE "public"."rate_type" AS ENUM('HOUR', 'DAY', 'PROJECT');--> statement-breakpoint
ALTER TABLE "artists" ADD COLUMN "payment_type" "payment_type";--> statement-breakpoint
ALTER TABLE "artists" ADD COLUMN "payment_details" jsonb;--> statement-breakpoint
ALTER TABLE "artists" ADD COLUMN "rate_type" "rate_type";--> statement-breakpoint
ALTER TABLE "artists" ADD COLUMN "currency_type" "currency_type" DEFAULT 'INR';--> statement-breakpoint
ALTER TABLE "artists" ADD COLUMN "amount" integer;