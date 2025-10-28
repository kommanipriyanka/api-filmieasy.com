import { serve } from "@hono/node-server";
import { Hono } from "hono";

import { appConfig } from "./config/appConfig";
import { testConnection } from "./database/db";

const app = new Hono();

const port = appConfig.port || 3000;
const apiversion = appConfig.version;

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

serve({
  fetch: app.fetch,
  port,
}, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on http://localhost:${port}`);
});

await testConnection();
