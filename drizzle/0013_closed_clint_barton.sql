CREATE TABLE "schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"artist_id" integer,
	"project_id" integer,
	"start_date" date,
	"end_date" date,
	"random_dates" text[],
	"created_at" timestamp,
	"updated_At" timestamp
);
--> statement-breakpoint
ALTER TABLE "artists" DROP CONSTRAINT "artists_email_unique";--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scenes" ADD CONSTRAINT "scenes_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "validUserIdx" ON "artists" USING btree ("email","invited_by");