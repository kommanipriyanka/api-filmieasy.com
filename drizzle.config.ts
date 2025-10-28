import { defineConfig } from "drizzle-kit";
import fs from "node:fs";

import { dbConfig } from "./src/config/dbConfig";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/database/schemas/*",
  out: "./drizzle",
  dbCredentials: {
    host: dbConfig.host!,
    port: dbConfig.port!,
    user: dbConfig.user!,
    password: dbConfig.password!,
    database: dbConfig.database!,
    ssl: {
      rejectUnauthorized: true,
      ca: fs.readFileSync("./ca.pem").toString(),
    },

  },
});
console.log("hello");
