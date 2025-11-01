CREATE TABLE "artistScenes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"scene_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "artistScenes" ADD CONSTRAINT "artistScenes_user_id_artists_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artistScenes" ADD CONSTRAINT "artistScenes_scene_id_scenes_id_fk" FOREIGN KEY ("scene_id") REFERENCES "public"."scenes"("id") ON DELETE no action ON UPDATE no action;