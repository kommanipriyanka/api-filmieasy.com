import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { artists } from "./artists";
import { scenes } from "./scenes";
import { relations } from "drizzle-orm";



export const artist_scenes = pgTable("artist_scenes",{
    id: serial("id").primaryKey().notNull(),
    artist_id :integer("artist_id").references(()=>artists.id),
    scene_id:integer("scene_id").references(()=>scenes.id),
    created_at:timestamp("created_at").defaultNow(),
    updated_at:timestamp("updated_at").defaultNow()
})

export type ArtistScene = typeof artist_scenes.$inferSelect;
export type newArtistScene = typeof artist_scenes.$inferInsert
export type ArtistSceneTable = typeof artist_scenes;


export const artistScenesRelations = relations(artist_scenes, ({ one }) => ({
  artist: one(artists, {
    fields: [artist_scenes.artist_id],
    references: [artists.id],
  }),
  scene: one(scenes, {
    fields: [artist_scenes.scene_id],
    references: [scenes.id],
  })
}));

