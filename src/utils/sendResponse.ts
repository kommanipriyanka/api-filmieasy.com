import type { Context } from "hono";

import { ContentfulStatusCode } from "hono/utils/http-status";
import { IRespWithData, IRespWithErrors } from "../types/appTypes";

export function sendResponse(c: Context, status: ContentfulStatusCode, message: string, data?: unknown) {
  const respData: IRespWithData = {
    status,
    success: true,
    message,
    data: data ?? null,
  };
  return c.json(respData, status);
}

export function sendErrorResponse(c: Context, status: ContentfulStatusCode, message: string, errors?: Record<string, string> | null) {
  const respData: IRespWithErrors = {
    status,
    success: false,
    message,
    errors: errors ?? null,
  };
  return c.json(respData, status);
}
