import * as v from "valibot";

import { PROJECT_NAME_REQUIRED } from "../constants/appMessages";

export const vCreateProject = v.pipe(
  v.object({
    name: v.pipe(v.string(PROJECT_NAME_REQUIRED), v.nonEmpty(PROJECT_NAME_REQUIRED)),
    description: v.optional(v.string()),
    genre: v.optional(v.string()),
    languages: v.optional(v.array(v.string())),
    estimated_budget: v.optional(v.number()),
    start_date: v.optional(v.string()), // "2025-01-10"
    end_date: v.optional(v.string()), // "2025-01-15"
    users: v.optional(v.array(v.number())),
  }),
  v.check(
    data =>
      !data.start_date
      || !data.end_date
      || data.end_date >= data.start_date,
    "End date must be after start date",
  ),
);
