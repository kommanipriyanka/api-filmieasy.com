import { relations } from "drizzle-orm";
import { pgEnum, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

import { scenes } from "./scenes";

export const locationTypeEnum = pgEnum("location_type", ["INDOOR", "OUTDOOR"]);

export const location = pgTable("location", {
  id: serial("id").primaryKey(),
  name: varchar("name"),
  type: locationTypeEnum("type"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  deleted_at: timestamp("deleted_at")


});

export type NewLocation = typeof location.$inferInsert;
export type Location = typeof location.$inferSelect;
export type LocationTable = typeof location;

