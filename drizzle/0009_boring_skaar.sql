ALTER TABLE "artistScenes" RENAME TO "artist_scenes";--> statement-breakpoint
ALTER TABLE "artist_scenes" DROP CONSTRAINT "artistScenes_user_id_artists_id_fk";
--> statement-breakpoint
ALTER TABLE "artist_scenes" DROP CONSTRAINT "artistScenes_scene_id_scenes_id_fk";
--> statement-breakpoint
ALTER TABLE "artist_scenes" ADD CONSTRAINT "artist_scenes_user_id_artists_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artist_scenes" ADD CONSTRAINT "artist_scenes_scene_id_scenes_id_fk" FOREIGN KEY ("scene_id") REFERENCES "public"."scenes"("id") ON DELETE no action ON UPDATE no action;