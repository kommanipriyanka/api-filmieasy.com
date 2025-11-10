import { integer, jsonb, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { artists } from "./artists";
import { projects } from "./projects";

export interface CallSheetData {
  date: string;
  scene_id: number;
  status: "Completed" | "Missed" | "Upcoming";
  notes?: string;
}
export const call_sheets = pgTable("call_sheets",{
    id:serial("id").primaryKey().notNull(),
    artist_id:integer("artist_id").references(()=>artists.id),
    project_id:integer("project_id").references(()=>projects.id),
    dates: jsonb("dates").$type<CallSheetData[]>().notNull().default([]),
    created_at:timestamp("created_at").defaultNow(),
    updated_at:timestamp("updated_at").defaultNow(),

})