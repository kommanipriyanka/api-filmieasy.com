import { relations } from "drizzle-orm";
import { integer, jsonb, pgTable, serial, timestamp } from "drizzle-orm/pg-core";

import { artists } from "./artists";
import { projects } from "./projects";

export interface CallSheetData {
  date: string;
  scene_id: number;
  status: "Completed" | "Missed" | "Upcoming";
  notes?: string;
}

export const artist_projects = pgTable("artist_projects", {
  id: serial("id").primaryKey().notNull(),
  artist_id: integer("artist_id").references(() => artists.id),
  project_id: integer("project_id").references(() => projects.id),
  dates: jsonb("dates").$type<CallSheetData[]>().notNull().default([]),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export type ArtistProject = typeof artist_projects.$inferSelect;
export type NewArtistProject = typeof artist_projects.$inferInsert;
export type ArtistProjectTable = typeof artist_projects;

export const artistProjectsRelations = relations(artist_projects, ({ one }) => ({
  project: one(projects, {
    fields: [artist_projects.project_id],
    references: [projects.id],
  }),
  artist: one(artists, {
    fields: [artist_projects.artist_id],
    references: [artists.id],
  }),
}));
