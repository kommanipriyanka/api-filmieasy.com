import * as v from "valibot";

import { DEPARTMENT_ID_REQUIRED, EMAIL_REQUIRED, GENDER_REQUIRED, INVALID_EMAIL, NAME_REQUIRED, PHONE_NO_INVALID, PHONE_NO_REQUIRED, ROLE_TYPE_REQUIRED } from "../constants/appMessages";
import { genderEnum, roleTypeEnum } from "../database/schemas/enums";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const vAvailableDateArray = v.pipe(
  v.array(
    v.pipe(
      v.string(),
      v.check(val => DATE_REGEX.test(val), "Date must be in YYYY-MM-DD format"),
      v.check(val => !Number.isNaN(Date.parse(val)), "Invalid date value"),
    ),
  ),
  v.check(arr => arr.length > 0, "At least one date required"),
  v.transform((arr) => {
    const normalized = arr.map((date) => {
      const d = new Date(date);
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(d.getUTCDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    });

    const unique = Array.from(new Set(normalized));
    unique.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    return unique;
  }),
);

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
  address: v.optional(
    v.pipe(
      v.string(),
      v.transform((value) => {
        const parts = value
          .split(/[,\\n]+/)
          .map(p => p.trim())
          .filter(Boolean);
        return parts.join(", ");
      }),
    ),
  ),
  languages: v.optional(v.array(v.string())),
  available_dates: v.optional(vAvailableDateArray),

});
