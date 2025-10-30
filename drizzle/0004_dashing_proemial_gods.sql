ALTER TABLE "projects" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "updated_at" timestamp DEFAULT now();