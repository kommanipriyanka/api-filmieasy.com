import { relations } from "drizzle-orm";
import { date, integer, jsonb, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { artist_scenes } from "./artistScenes";
import { departments } from "./department";
import { currencyTypeEnum, genderEnum, paymentTypeEnum, rateTypeEnum, roleTypeEnum } from "./enums";
import { users } from "./users";

export interface ArtistAvailability {
  date: string;
  status: "Available" | "Unavailable";
  notes?: string;
}

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
  available_dates: jsonb("available_dates").$type<ArtistAvailability[]>().notNull().default([]),
  profile_pic: varchar("profile_pic"),
  payment_type: paymentTypeEnum("payment_type"),
  payment_details: jsonb("payment_details").$type<{ bank_name?: string; account_number?: string; ifsc_code?: string; branch_name?: string; upi_id?: string; name?: string } | null>(),
  rate_type: rateTypeEnum("rate_type"),
  currency_type: currencyTypeEnum("currency_type").default("INR"),
  amount:integer("amount"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  deleted_at: timestamp("deleted_at"),
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
