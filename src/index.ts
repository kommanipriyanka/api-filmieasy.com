import type { Context } from "hono";

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { appConfig } from "./config/appConfig";
import { DEF_ERROR_RESP } from "./constants/appMessages";
import { testConnection } from "./database/db";
import { authRoutes } from "./routes/authRoutes";
import { departmentRoutes } from "./routes/departmentRoutes";
import { dummyRoutes } from "./routes/dummyRoutes";
import { fileRoutes } from "./routes/fileRoutes";
import { locationRoutes } from "./routes/locationRoutes";
import { projectRoutes } from "./routes/projectRoutes";
import { sceneRoutes } from "./routes/sceneRoutes";
import { userRoutes } from "./routes/userRoutes";

const app = new Hono();

const port = appConfig.port || 3000;

app.get("/", (c) => {
  return c.text("Hello Hono!");
});
app.use("*", cors());

app.route("/auth", authRoutes);
app.route("/department", departmentRoutes);
app.route("/user", userRoutes);
app.route("/project", projectRoutes);
app.route("/file", fileRoutes);
app.route("/scene", sceneRoutes);
app.route("/location", locationRoutes);

app.route("/dummy", dummyRoutes);

app.onError((err: any, c: Context) => {
  const statusCode = err.status || 555;
  const errorMessage = err.message || DEF_ERROR_RESP;
  const method = c.req.method;
  const requestUrl = c.req.url;
  const timestamp = new Date().toISOString();
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
