import { drizzle } from "drizzle-orm/node-postgres";
import fs from "node:fs";
import pg from "pg";

import { dbConfig } from "../config/dbConfig";

const { Pool } = pg;

const pool = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("./ca.pem").toString(),
  },
});

export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log(" Database connection successful");
    client.release();
  }
  catch (err) {
    console.error("Database connection failed");
    console.error(err);
    process.exit(1);
  }
}

const db = drizzle(pool);
export default db;
