import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const departments = pgTable("departments", {
  id: serial("id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});
