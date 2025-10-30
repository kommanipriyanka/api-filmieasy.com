import { relations } from "drizzle-orm";
import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";

import { artists } from "./artists";
import { projects } from "./projects";

export const artistProjects = pgTable("artistProjects", {
  id: serial("id").primaryKey().notNull(),
  artist_id: integer("artist_id").references(() => artists.id),
  project_id: integer("project_id").references(() => projects.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export type ArtistProject = typeof artistProjects.$inferSelect;
export type NewArtistProject = typeof artistProjects.$inferInsert;
export type ArtistProjectTable = typeof artistProjects;

export const artistProjectsRelations = relations(artistProjects, ({ one }) => ({
  project: one(projects, {
    fields: [artistProjects.project_id],
    references: [projects.id],
  }),
  artist: one(artists, {
    fields: [artistProjects.artist_id],
    references: [artists.id],
  }),
}));
