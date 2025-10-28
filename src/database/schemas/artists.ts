import { date, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { departments } from "./department";
import { genderEnum, roleTypeEnum } from "./enums";
import { users } from "./users";

export const artists = pgTable("artists", {
  id: serial("id").primaryKey().notNull(),
  full_name: varchar("full_name"),
  email: varchar("email").unique().notNull(),
  phone: varchar("phone"),
  gender: genderEnum("gender"),
  DOB: date("DOB"),
  address: varchar("address"),
  role_type: roleTypeEnum("role_type"),
  languages: text("languages").array(),
  experience: integer("experience"),
  department_id: integer("department_id").references(() => departments.id),
  invited_by: integer("invited_by").references(() => users.id),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});
