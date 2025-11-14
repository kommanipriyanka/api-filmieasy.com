ALTER TABLE "artist_projects" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "artists" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "artist_scenes" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "location" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "scenes" ADD COLUMN "deleted_at" timestamp;