import * as v from "valibot";

import { DEPARTMENT_ID_REQUIRED, DOB_IN_FUTURE, DOB_INVALID_DATE, DOB_INVALID_FORMAT, EMAIL_REQUIRED, GENDER_REQUIRED, INVALID_EMAIL, NAME_REQUIRED, PHONE_NO_INVALID, PHONE_NO_REQUIRED, ROLE_TYPE_REQUIRED } from "../constants/appMessages";
import { currencyTypeEnum, genderEnum, paymentTypeEnum, rateTypeEnum, roleTypeEnum } from "../database/schemas/enums";

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

function nonBlankName(fieldName: string) {
  return v.pipe(
    v.string(`${fieldName} is required`),
    v.transform(s => String(s ?? "").trim()),
    v.nonEmpty(`${fieldName} is required`),
    v.check(s => /\p{L}/u.test(s), `${fieldName} must contain letters or numbers`),
  );
}

export const vArtistObject = v.object({
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
    v.check(s => /^[\p{L} ]+$/u.test(s), "Full name can contain only letters and spaces"),
    v.transform(value => {
      return String(value ?? "")
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    })
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
    v.transform(val => val.toUpperCase()),
    v.picklist(roleTypeEnum.enumValues, "Invalid role type"),
  ),
  experience: v.optional(v.number()),
  department_id: v.number(DEPARTMENT_ID_REQUIRED),
  DOB: v.optional(
    v.pipe(
      v.string(),
      v.nonEmpty(DOB_INVALID_FORMAT),
      v.regex(/^\d{2}-\d{2}-\d{4}$/, DOB_INVALID_FORMAT),
      v.check(s => {
        const [dd, mm, yyyy] = s.split("-");
        const date = new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
        return (
          !isNaN(date.getTime()) &&
          date.getUTCDate() == Number(dd) &&
          date.getUTCMonth() + 1 == Number(mm) &&
          date.getUTCFullYear() == Number(yyyy)
        );
      }, DOB_INVALID_DATE),
      v.check(s => {
      const [dd, mm, yyyy] = s.split("-");
      const input = `${yyyy}-${mm}-${dd}`;
      const today = new Date().toISOString().slice(0, 10);
      return input <= today;
      }, DOB_IN_FUTURE),
    )
 ),

  address: v.optional(
    v.pipe(
      v.union([v.string(), v.null()]),
      v.transform(val => {
        const parts = String(val ?? "")
        .split(",")
        .map(p => p.trim())
        .filter(Boolean)
        .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
        return parts.length ? parts.join(", ") : undefined;
      })
    )
  ),
  languages: v.optional(
    v.pipe(
      v.union([v.array(v.string()), v.null()]),
      v.transform(val => val ?? undefined),
      v.transform((arr?: string[]) =>
        arr?.map(l =>String(l).trim().toLowerCase().replace(/^./, c => c.toUpperCase()))
      )
    )
  ),
  available_dates: v.optional(v.pipe(
    v.union([vAvailableDateArray, v.null()]),
    v.transform(val => (val === null ? undefined : val)),
  ),
  ),
  profile_pic: v.optional(v.union([v.string(), v.null()])),
  payment_type: v.optional(
    v.pipe(
      v.string(),
      v.transform(val => String(val ?? "").toUpperCase()),
      v.picklist(paymentTypeEnum.enumValues, "Invalid payment type"),
    ),
  ),
  payment_details: v.optional(
    v.object({
      bank_name: v.optional(nonBlankName("Bank_name")),
      branch_name: v.optional(nonBlankName("Branch_name")),
      name: v.optional(nonBlankName("Name")),
      account_number: v.optional(nonBlankName("Account_number")),
      ifsc_code: v.optional(nonBlankName("IFSC_code")),
      upi_id: v.optional(nonBlankName("Upi_id")),
    }),
  ),
  rate_type: v.optional(v.pipe(v.string(), v.transform(val => String(val).toUpperCase()), v.picklist(rateTypeEnum.enumValues, "Invalid rate type"))),
  currency_type: v.optional(v.pipe(v.string(), v.transform(val => String(val).toUpperCase()), v.picklist(currencyTypeEnum.enumValues, "Invalid currency type"), v.transform(val => val ?? "INR"))),
  amount: v.optional(v.pipe(v.number(), v.check(n => Number.isInteger(n), "Amount must be an integer"), v.check(n => n >= 0, "Amount cannot be negative")),
  ),
});

export const vArtistSchema = v.pipe(
  vArtistObject,
  v.check(
    (d: any) =>
      !!(!d.payment_type || d.payment_type !== "BANK" || (d.payment_details !== null && d.payment_details !== undefined)),
    "Bank details are required",
  ),
  v.check(
    (d: any) =>
      !!(!d.payment_type || d.payment_type !== "BANK" || d.payment_details === undefined || d.payment_details === null || (d.payment_details && d.payment_details.bank_name)),
    "Bank_name is required for BANK payment type",
  ),
  v.check((d: any) => !!(!d.payment_type || d.payment_type !== "BANK" || d.payment_details === undefined || d.payment_details === null || (d.payment_details && d.payment_details.account_number)), "Account_number is required for BANK payment type"),
  v.check(
    (d: any) =>
      !!(!d.payment_type || d.payment_type !== "BANK" || d.payment_details === undefined || d.payment_details === null || (d.payment_details && d.payment_details.ifsc_code)),
    "IFSC_code is required for BANK payment type",
  ),
  v.check((d: any) => !!(!d.payment_type || d.payment_type !== "BANK" || d.payment_details === undefined || d.payment_details === null || (d.payment_details && d.payment_details.name)), "Name is required for BANK payment type"),
  v.check((d: any) => !!(!d.payment_type || d.payment_type !== "BANK" || d.payment_details === undefined || d.payment_details === null || (d.payment_details && d.payment_details.branch_name)), "Branch_name is required for BANK payment type"),
  v.check((d: any) =>
    !!(
      !d.payment_type
      || d.payment_type !== "UPI"
      || (d.payment_details !== null && d.payment_details !== undefined)
    ), "UPI details are required "),
  v.check(
    (d: any) =>
      !!(
        !d.payment_type
        || d.payment_type !== "UPI"
        || d.payment_details === undefined
        || d.payment_details === null
        || (typeof d.payment_details === "object")
      ),
    "Payment_details must be an object for UPI payment type",
  ),

  v.check(
    (d: any) =>
      !!(
        !d.payment_type
        || d.payment_type !== "UPI"
        || d.payment_details === undefined
        || d.payment_details === null
        || (
          typeof d.payment_details.upi_id === "string"
          && /^[6-9]\d{9}$/.test(d.payment_details.upi_id)
        )
      ),
    "upi_id is invalid",
  ),

  v.check(
    (d: any) =>
      !!(
        !d.payment_type
        || d.payment_type !== "UPI"
        || d.payment_details === undefined
        || d.payment_details === null
        || (d.payment_details && d.payment_details.name)
      ),
    "name is required ",
  ),

  v.transform((obj) => {
    const out = { ...obj };
    if (out.payment_type === "CASH")
      out.payment_details = null;
    return out;
  }),
);

export const vArtistUpdateSchema = v.partial(vArtistObject);
