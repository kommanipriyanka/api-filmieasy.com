ALTER TABLE "artistProjects" RENAME TO "artist_projects";--> statement-breakpoint
ALTER TABLE "artist_projects" DROP CONSTRAINT "artistProjects_artist_id_artists_id_fk";
--> statement-breakpoint
ALTER TABLE "artist_projects" DROP CONSTRAINT "artistProjects_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "artist_projects" ADD CONSTRAINT "artist_projects_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artist_projects" ADD CONSTRAINT "artist_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;