import type { Context } from "hono";

import { serve } from "@hono/node-server";
import { Hono } from "hono";

import { appConfig } from "./config/appConfig";
import { DEF_ERROR_RESP } from "./constants/appMessages";
import { testConnection } from "./database/db";
import { userRoutes } from "./routes/userRoutes";

const app = new Hono();

const port = appConfig.port || 3000;
const apiversion = appConfig.version;

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/auth", userRoutes);
app.onError((err: any, c: Context) => {
  const statusCode = err.status || 555;
  const errorMessage = err.message || DEF_ERROR_RESP;
  const method = c.req.method;
  const requestUrl = c.req.url;
  const timestamp = new Date().toISOString();

  console.error(err);

  c.status(statusCode);
  return c.json({
    status: statusCode,
    success: false,
    message: errorMessage,
    name: err.name ?? "UnhandledError",
    errData: err.errData ?? undefined,
    path: requestUrl,
    method,
    timestamp,
  });
});

serve({
  fetch: app.fetch,
  port,
}, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on http://localhost:${port}`);
});

await testConnection();
