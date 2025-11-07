CREATE TYPE "public"."location_type" AS ENUM('INDOOR', 'OUTDOOR');--> statement-breakpoint
CREATE TABLE "location" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar,
	"type" "location_type",
	"latitude" numeric,
	"longitude" numeric,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "scenes" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "scenes" ADD COLUMN "location_id" integer;