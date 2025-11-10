import { relations } from "drizzle-orm";
import { date, integer, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { artist_scenes } from "./artistScenes";
import { departments } from "./department";
import { genderEnum, roleTypeEnum } from "./enums";
import { users } from "./users";

export const artists = pgTable("artists", {
  id: serial("id").primaryKey().notNull(),
  full_name: varchar("full_name"),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  gender: genderEnum("gender"),
  DOB: date("DOB"),
  address: varchar("address"),
  role_type: roleTypeEnum("role_type"),
  languages: text("languages").array(),
  experience: integer("experience"),
  department_id: integer("department_id").references(() => departments.id),
  invited_by: integer("invited_by").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, table => [
  uniqueIndex("validUserIdx").on(table.email, table.invited_by),
]);
export type Artist = typeof artists.$inferSelect;
export type NewArtist = typeof artists.$inferInsert;
export type ArtistTable = typeof artists;

export const artistsRelations = relations(artists, ({ one, many }) => ({
  department: one(departments, {
    fields: [artists.department_id],
    references: [departments.id],
  }),
  artistScenes: many(artist_scenes),
}));
