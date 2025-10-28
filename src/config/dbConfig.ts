import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from "../env";

export const dbConfig = {
  host: DB_HOST,
  port: Number(DB_PORT)!,
  user: DB_USER!,
  password: DB_PASSWORD!,
  database: DB_NAME!,
};
