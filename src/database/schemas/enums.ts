import { pgEnum } from "drizzle-orm/pg-core";

export const roleTypeEnum = pgEnum("role_type", [
  "ACTOR",
  "ACTRESS",
  "PRODUCER",
  "DIRECTOR",
  "COSTUME DESIGNER",
]);

export const genderEnum = pgEnum("gender", [
  "MALE",
  "FEMALE",
  "OTHERS",
]);

export const projectStatusEnum = pgEnum("status", ["TODO", "ONGOING", "COMPLETED"]);

export const paymentTypeEnum = pgEnum("payment_type", ["BANK", "UPI", "CASH"]);

export const rateTypeEnum = pgEnum("rate_type",["HOUR","DAY","PROJECT"]);

export const currencyTypeEnum = pgEnum("currency_type",["INR","DOLLARS"]);
