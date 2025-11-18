import * as v from "valibot";

import { PROJECT_NAME_REQUIRED, SCENE_NAME_REQUIRED } from "../constants/appMessages";

const isValidDate = (value: string) => !Number.isNaN(Date.parse(value));

export const vUpdateProject = v.pipe(
  v.object({
    name: v.optional(v.pipe(
      v.string(PROJECT_NAME_REQUIRED),
      v.regex(/^[A-Z0-9 ]+$/i, "Project name can only contain letters, numbers, and spaces."),
      v.transform((value) => {
        return value
          .trim()
          .toLowerCase()
          .split(/\s+/)
          .map(word =>
            /^\d/.test(word) ? word : word.charAt(0).toUpperCase() + word.slice(1),
          )
          .join(" ");
      }),
    )),
    description: v.optional(v.pipe(v.string(),v.transform(s =>String(s ?? "").trim().replace(/^./, c => c.toUpperCase())))),
    genre: v.optional(v.pipe(v.string(),v.transform(s =>String(s ?? "").trim().replace(/^./, c => c.toUpperCase())))),
    languages: v.optional(v.pipe(v.array(v.string()),v.transform(arr =>arr.map(l =>String(l ?? "").trim().replace(/^./, c => c.toUpperCase()))))),
    estimated_budget: v.optional(v.number()),
    start_date: v.optional(
      v.pipe(
        v.string(),
        v.check(value => isValidDate(value), "Invalid start_date format"),
      ),
    ),
    end_date: v.optional(
      v.pipe(
        v.string(),
        v.check(value => isValidDate(value), "Invalid end_date format"),
      ),
    ),
    team_members_add: v.optional(v.array(v.number())),
    team_members_remove: v.optional(v.array(v.number())),
    project_logo: v.optional(v.string()),
  }),
  v.check(
    data =>
      !data.start_date
      || !data.end_date
      || data.end_date >= data.start_date,
    "End date must be after start date",
  ),
);

export const vScene = v.pipe(
  v.object({
    name: v.pipe(
      v.string(SCENE_NAME_REQUIRED),
      v.nonEmpty(SCENE_NAME_REQUIRED),
      v.transform((value) => {
        return value
          .trim()
          .toLowerCase()
          .split(/\s+/)
          .map(word =>
            /^\d/.test(word) ? word : word.charAt(0).toUpperCase() + word.slice(1),
          )
          .join(" ");
      }),
    ),
  description: v.optional(v.pipe(v.string(),v.transform(s =>String(s ?? "").trim().replace(/^./, c => c.toUpperCase())))),
  scene_members: v.optional(v.array(v.number())),
  scene_path: v.optional(v.string()),
  start_date: v.optional(
      v.pipe(
        v.string(),
        v.check(value => isValidDate(value), "Invalid start_date format"),
      ),
    ),
  end_date: v.optional(
      v.pipe(
        v.string(),
        v.check(value => isValidDate(value), "Invalid end_date format"),
      ),
    ),
  }),

  v.check(
    data =>
      !data.start_date
      || !data.end_date
      || new Date(data.end_date) >= new Date(data.start_date),
    "Scene end date must be after or equal to start date",
  ),
);

export const vCreateProject = v.pipe(
  v.object({
    name: v.pipe(
      v.string(PROJECT_NAME_REQUIRED),
      v.nonEmpty(PROJECT_NAME_REQUIRED),
      v.regex(/^[A-Z0-9 ]+$/i, "Project name can only contain letters, numbers, and spaces."),
      v.transform((value) => {
        return value
          .trim()
          .toLowerCase()
          .split(/\s+/)
          .map(word =>
            /^\d/.test(word) ? word : word.charAt(0).toUpperCase() + word.slice(1),
          )
          .join(" ");
      }),
    ),

    description: v.optional(v.string()),
    genre: v.optional(v.string()),
    languages: v.optional(v.array(v.string())),
    estimated_budget: v.optional(v.number()),

    start_date: v.optional(v.string()),
    end_date: v.optional(v.string()),
    project_logo: v.optional(v.string()),
    team_members: v.optional(v.array(v.number())),
    project_scenes: v.optional(v.array(vScene)),
  }),
  v.check(
    data =>
      !data.start_date
      || !data.end_date
      || data.end_date >= data.start_date,
    "Project end date must be after start date",
  ),
);

export type UpdateProject = v.InferInput<typeof vUpdateProject>;
export type CreateProject = v.InferInput<typeof vCreateProject>;
