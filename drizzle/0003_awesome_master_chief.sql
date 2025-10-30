CREATE TYPE "public"."status" AS ENUM('TODO', 'ONGOING', 'COMPLETED');--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"genre" varchar,
	"languages" text[],
	"start_date" date,
	"end_date" date,
	"status" "status" DEFAULT 'TODO',
	"estimated_budget" integer,
	"created_by" integer
);
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;