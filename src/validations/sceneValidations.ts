import * as v from "valibot";

import { SCENE_NAME_REQUIRED } from "../constants/appMessages";

const isValidDate = (value: string) => !Number.isNaN(Date.parse(value));

export const vCreateScene = v.pipe(
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
    script_path: v.optional(v.string()),

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
    "End date must be after or equal to Start date",
  ),
);

export type createScene = v.InferInput<typeof vCreateScene>;


