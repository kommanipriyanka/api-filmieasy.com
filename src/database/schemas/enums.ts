import { pgEnum } from "drizzle-orm/pg-core";

export const roleTypeEnum = pgEnum("role_type", [
  "ACTOR",
  "ACTRESS",
  "PRODUCER",
  "DIRECTOR",
]);

export const genderEnum = pgEnum("gender", [
  "MALE",
  "FEMALE",
  "OTHERS",
]);
