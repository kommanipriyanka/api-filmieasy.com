import type { BaseSchema, InferOutput } from "valibot";

import { safeParse } from "valibot";

import UnprocessableEntityException from "../exceptions/unprocessableEntityException";

export function validateRequestBody<TSchema extends BaseSchema<any, any, any>>(
  schema: TSchema,
  body: unknown,
): InferOutput<TSchema> {
  const res = safeParse(schema, body);

  if (!res.success) {
    const validationError = res.issues.reduce((acc, issue) => {
      const key = issue.path?.[0]?.key || "unknown";
      let message = issue.message;

      if (message.startsWith("Invalid key")) {
        message = `${String(key)} is required`;
      }

      acc[String(key)] = message;
      return acc;
    }, {} as Record<string, string>);

    throw new UnprocessableEntityException("Validation error", validationError);
  }

  return res.output;
}
