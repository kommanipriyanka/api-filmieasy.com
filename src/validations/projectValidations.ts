import * as v from "valibot";

import { PROJECT_NAME_REQUIRED } from "../constants/appMessages";

export const vCreateProject = v.pipe(
  v.object({
    name: v.pipe(
    v.string(PROJECT_NAME_REQUIRED),
    v.nonEmpty(PROJECT_NAME_REQUIRED),
    v.regex(/^[A-Za-z0-9 ]+$/, "Project name can only contain letters, numbers, and spaces."),
    v.transform((value) => {
      return value
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map((word) =>
          /^\d/.test(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
      })
    ),
    description: v.optional(v.string()),
    genre: v.optional(v.string()),
    languages: v.optional(v.array(v.string())),
    estimated_budget: v.optional(v.number()),
    start_date: v.optional(v.string()), // "2025-01-10"
    end_date: v.optional(v.string()), // "2025-01-15"
    team_members: v.optional(v.array(v.number())),
    project_logo:v.optional(v.string()),
  }),
  v.check(
    data =>
      !data.start_date
      || !data.end_date
      || data.end_date >= data.start_date,
    "End date must be after start date",
  ),
);
