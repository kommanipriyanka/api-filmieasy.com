import { date, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { projectStatusEnum } from "./enums";
import { users } from "./users";
import { relations } from "drizzle-orm";
import { artistProjects } from "./artistProjects";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  description: varchar("description"),
  genre: varchar("genre"),
  languages: text("languages").array(),
  start_date: date("start_date"),
  end_date: date("end_date"),
  status: projectStatusEnum("status").default("TODO"),
  estimated_budget: integer("estimated_budget"),
  project_logo: varchar("project_logo"),
  created_by: integer("created_by").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),

});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectTable = typeof projects;

export const projectsRelations = relations(projects, ({ many }) => ({
  members: many(artistProjects), 
}));
