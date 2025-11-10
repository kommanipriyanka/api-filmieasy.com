import { relations } from "drizzle-orm";
import { date, integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

import { artist_scenes } from "./artistScenes";
import { location } from "./location";
import { projects } from "./projects";

export const scenes = pgTable("scenes", {
  id: serial("id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  description: varchar("description"),
  project_id: integer("project_id").references(() => projects.id),
  start_date: date("start_date"),
  end_date: date("end_date"),
  script_path: varchar("script_path"),
  location_id: integer("location_id").references(() => location.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),

});

export type Scene = typeof scenes.$inferSelect;
export type NewScene = typeof scenes.$inferInsert;
export type SceneTable = typeof scenes;

export const scenesRelations = relations(scenes, ({ many, one }) => ({
  artistScenes: many(artist_scenes),
  location: one(location),
}));
