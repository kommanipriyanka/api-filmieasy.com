import * as v from "valibot";

import { EMAIL_REQUIRED, INVALID_EMAIL, NAME_REQUIRED, PASSWORD_INVALID, PASSWORD_LENGTH, PASSWORD_REQUIRED, PHONE_NO_INVALID, PHONE_NO_REQUIRED } from "../constants/appMessages";

export const vSignUpUser = v.object({
  email: v.pipe(
    v.string(EMAIL_REQUIRED),
    v.nonEmpty(EMAIL_REQUIRED),
    v.email(INVALID_EMAIL),
    v.custom((val: any) => val === val.toLowerCase()),
  ),

  password: v.pipe(
    v.string(PASSWORD_REQUIRED),
    v.nonEmpty(PASSWORD_REQUIRED),
    v.minLength(8, PASSWORD_LENGTH),
    v.regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      PASSWORD_INVALID,
    ),
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
});

export const vLoginUser = v.object({
  email: v.pipe(
    v.string(EMAIL_REQUIRED),
    v.nonEmpty(EMAIL_REQUIRED),
    v.email(INVALID_EMAIL),
    v.custom((val: any) => val === val.toLowerCase()),
  ),
  password: v.pipe(
    v.string(PASSWORD_REQUIRED),
    v.nonEmpty(PASSWORD_REQUIRED),
  ),
});
