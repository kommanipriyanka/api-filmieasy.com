import { date, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { artists } from "./artists";
import { projects } from "./projects";



export const schedules = pgTable("schedules",{
    id : serial("id").primaryKey(),
    artist_id:integer("artist_id").references(()=>artists.id),
    project_id:integer("project_id").references(()=>projects.id),
    start_date:date("start_date"),
    end_date:date("end_date"),
    random_dates:text("random_dates").array(),
    created_at:timestamp("created_at"),
    updated_at:timestamp("updated_At")

})



