import * as v from "valibot";

import { DEPARTMENT_REQUIRED } from "../constants/appMessages";

export const vDepartmentSchema = v.object({
  name: v.pipe(
    v.string(DEPARTMENT_REQUIRED),
    v.nonEmpty(DEPARTMENT_REQUIRED),
    v.transform((value) => {
      const trimmed = value.trim().toLowerCase(); 
      return trimmed
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "); 
    })
  ),
});

