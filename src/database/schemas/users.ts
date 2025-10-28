import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  full_name: varchar("full_name"),
  phone: varchar("phone"),
  password: varchar("password"),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});
