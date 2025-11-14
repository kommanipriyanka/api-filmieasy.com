import * as v from "valibot";

import { SCENE_NAME_REQUIRED } from "../constants/appMessages";

const isValidDate = (value: string) => !Number.isNaN(Date.parse(value));

export const vCreateScene = v.pipe(
  v.object({
    name: v.pipe(
      v.string(SCENE_NAME_REQUIRED),
      v.nonEmpty(SCENE_NAME_REQUIRED),
    ),

    description: v.optional(v.string()),
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
