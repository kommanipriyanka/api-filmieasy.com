import { relations } from "drizzle-orm";
import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

import { artists } from "./artists";
import { users } from "./users";

export const departments = pgTable("departments", {
  id: serial("id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  created_by: integer("created_by").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
export type DepartmentTable = typeof departments;

export const departmentsRelations = relations(departments, ({ many }) => ({
  artists: many(artists),
}));
