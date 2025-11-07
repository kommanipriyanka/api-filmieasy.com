import * as v from "valibot";

import { DEPARTMENT_ID_REQUIRED, EMAIL_REQUIRED, GENDER_REQUIRED, INVALID_EMAIL, NAME_REQUIRED, PHONE_NO_INVALID, PHONE_NO_REQUIRED, ROLE_TYPE_REQUIRED } from "../constants/appMessages";
import { genderEnum, roleTypeEnum } from "../database/schemas/enums";
import { validateRequestBody } from "./validateRequest";

export const vArtistSchema = v.object({
  email: v.pipe(
    v.string(EMAIL_REQUIRED),
    v.nonEmpty(EMAIL_REQUIRED),
    v.email(INVALID_EMAIL),
    v.transform(val => val.toLowerCase()),

  ),
  phone: v.pipe(
    v.string(PHONE_NO_REQUIRED),
    v.nonEmpty(PHONE_NO_REQUIRED),
    v.regex(/^[6-9]\d{9}$/, PHONE_NO_INVALID),
  ),
  full_name: v.pipe(
    v.string(NAME_REQUIRED),
    v.nonEmpty(NAME_REQUIRED),
  ),
  gender: v.pipe(
    v.string(GENDER_REQUIRED),
    v.nonEmpty(GENDER_REQUIRED),
    v.transform(val => val.toUpperCase()),
    v.picklist(genderEnum.enumValues, "Invalid gender"),
  ),
  role_type: v.pipe(
    v.string(ROLE_TYPE_REQUIRED),
    v.nonEmpty(ROLE_TYPE_REQUIRED),
    v.picklist(roleTypeEnum.enumValues, "Invalid role type"),
  ),  
  experience: v.optional(v.number()),
  department_id: v.number(DEPARTMENT_ID_REQUIRED),
  DOB: v.optional(
    v.pipe(
      v.string(),
      v.transform((value) => {
        const [day, month, year] = value.split("-");
        return `${year}-${month}-${day}`;
      }),
    ),
  ),
  address: v.optional(v.string()),
  languages: v.optional(v.array(v.string())),
});





export const validateArtistRows = async (rows: any[]) => {
  const validationResults = await Promise.all(
    rows.map(async (row: any, index: number) => {
      const rowIndex = index + 2;

      try {
        const validated = validateRequestBody(vArtistSchema, row);
        return { type: "valid", data: { ...validated, rowIndex } };
      } 
      catch (error: any) {
        return {
          type: "invalid",
          data: { rowIndex, reason: error.errors ?? { general: error.message } },
        };
      }
    })
  );

  const validRows = validationResults
    .filter((r) => r.type === "valid")
    .map((r) => r.data);

  const invalidRows = validationResults
    .filter((r) => r.type === "invalid")
    .map((r) => r.data);

  return { validRows, invalidRows };
};
