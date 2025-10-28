import "dotenv/config";
import type { InferOutput, ValiError } from "valibot";

import { flatten, object, parseAsync, pipe, string, transform } from "valibot";

export const DATABASE_URL = process.env.DATABASE_URL
export const API_VERSION = process.env.API_VERSION
export const PORT = process.env.PORT
export const DB_USER = process.env.DB_USER
export const DB_PASSWORD = process.env.DB_PASSWORD
export const DB_HOST = process.env.DB_HOST
export const DB_PORT = process.env.DB_PORT
export const DB_NAME = process.env.DB_NAME

// const VEnvSchema = object({
//   API_VERSION: string(),
//   PORT: pipe(
//     string(),
//     transform(val => Number(val)),
//   ),
//   DB_HOST: string(),
//   DB_PORT: pipe(
//     string(),
//     transform(val => Number(val)),
//   ),
//   DB_USER: string(),
//   DB_PASSWORD: string(),
//   DB_NAME: string(),
// });

// export type Env = InferOutput<typeof VEnvSchema>;

// // eslint-disable-next-line import/no-mutable-exports
// let envData: Env;

// try {
//   // eslint-disable-next-line node/no-process-env
//   envData = parseAsync(VEnvSchema, process.env, {
//     abortPipeEarly: true,
//   });
// }
// catch (e) {
//   const error = e as ValiError<typeof VEnvSchema>;
//   console.error("❌ Invalid Env");
//   console.error(flatten(error.issues));
//   process.exit(1);
// }

// export default envData;
