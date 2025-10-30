CREATE TABLE "artistProjects" (
	"id" serial PRIMARY KEY NOT NULL,
	"artist_id" integer,
	"project_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "artistProjects" ADD CONSTRAINT "artistProjects_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artistProjects" ADD CONSTRAINT "artistProjects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;