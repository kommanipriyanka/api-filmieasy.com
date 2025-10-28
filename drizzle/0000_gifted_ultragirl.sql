CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE', 'OTHERS');--> statement-breakpoint
CREATE TYPE "public"."role_type" AS ENUM('ACTOR', 'ACTRESS', 'PRODUCER', 'DIRECTOR');--> statement-breakpoint
CREATE TABLE "artists" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar,
	"email" varchar NOT NULL,
	"phone" varchar,
	"gender" "gender",
	"DOB" date,
	"address" varchar,
	"role_type" "role_type",
	"languages" text[],
	"experience" integer,
	"department_id" integer,
	"invited_by" integer,
	"created_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "artists_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"full_name" varchar,
	"phone" varchar,
	"password" varchar,
	"created_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "artists" ADD CONSTRAINT "artists_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artists" ADD CONSTRAINT "artists_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;