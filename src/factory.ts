import type { PinoLogger } from "hono-pino";

import { createFactory } from "hono/factory";

interface Variables {
  logger: PinoLogger;
}

interface AppBindings {
  Variables: Variables;
}

const factory = createFactory<AppBindings>();

export default factory;
