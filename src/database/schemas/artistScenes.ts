import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { artists } from "./artists";
import { scenes } from "./scenes";



export const artistScenes = pgTable("artistScenes",{
    id: serial("id").primaryKey().notNull(),
    user_id :integer("user_id").references(()=>artists.id),
    scene_id:integer("scene_id").references(()=>scenes.id),
    created_at:timestamp("created_at").defaultNow(),
    updated_at:timestamp("updated_at").defaultNow()
})

export type ArtistScene = typeof artistScenes.$inferSelect;
export type newArtistScene = typeof artistScenes.$inferInsert
export type ArtistSceneTable = typeof artistScenes;

