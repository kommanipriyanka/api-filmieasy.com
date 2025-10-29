import * as v from "valibot";

import { DEPARTMENT_REQUIRED } from "../constants/appMessages";

export const vDepartmentSchema = v.object({
  name: v.pipe(
    v.string(DEPARTMENT_REQUIRED),
    v.nonEmpty(DEPARTMENT_REQUIRED),
  ),
});
