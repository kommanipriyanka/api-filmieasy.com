ALTER TABLE "artist_scenes" RENAME COLUMN "user_id" TO "artist_id";--> statement-breakpoint
ALTER TABLE "artist_scenes" DROP CONSTRAINT "artist_scenes_user_id_artists_id_fk";
--> statement-breakpoint
ALTER TABLE "artist_scenes" ADD CONSTRAINT "artist_scenes_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE no action ON UPDATE no action;