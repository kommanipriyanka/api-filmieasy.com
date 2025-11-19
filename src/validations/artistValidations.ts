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


export const vArtistObject = v.object({
  email: v.pipe(
    v.string(EMAIL_REQUIRED),
    v.nonEmpty(EMAIL_REQUIRED),
    v.transform(s => String(s ?? "").trim()),
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
    v.check(s => /^[\p{L} ]+$/u.test(s), "Full name  contains only letters and spaces"),
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
      v.transform(s => {
        const [dd, mm, yyyy] = s.split("-");
        return `${yyyy}-${mm}-${dd}`;  
      }),
    )),

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
      v.transform((arr?: string[]) =>arr?.map(l =>String(l).trim().toLowerCase().replace(/^./, c => c.toUpperCase())))
    )),
  available_dates: v.optional(v.pipe(
    v.union([vAvailableDateArray, v.null()]),
    v.transform(val => (val === null ? undefined : val)),
  )),
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
      bank_name: v.optional(v.pipe(v.string("Bank name is required"),v.transform(s => String(s ?? "").trim()),v.nonEmpty("Bank name is required"),
        v.check(s => /^[\p{L} ]+$/u.test(s),"Bank name must contain only letters and spaces"),
    )),
    branch_name: v.optional(
      v.pipe(v.string("Branch name is required"),v.transform(s => String(s ?? "").trim()),v.nonEmpty("Branch name is required"),
        v.check( s => /^[\p{L}\d \-\/]+$/u.test(s),"Branch name can contain letters, numbers, spaces, hyphens or slashes"),
    )),
    name: v.optional(
      v.pipe(v.string("Name is required"),v.transform(s => String(s ?? "").trim()),v.nonEmpty("Name is required"),
        v.check(s => /^[\p{L} ]+$/u.test(s),"Name must contain only letters and spaces"),
    )),
    account_number: v.optional(
      v.pipe(v.string("Account number is required"),v.transform(s => String(s ?? "").trim()),v.nonEmpty("Account number is required"),
        v.check(s => /^\d+$/.test(s),"Account number  contains only digits"),
    )),
    ifsc_code: v.optional(
      v.pipe(v.string("IFSC code is required"),v.transform(s => String(s ?? "").trim()),v.nonEmpty("IFSC code is required"),
        v.check(s => /^[A-Za-z]{4}\d{7}$/.test(s),"IFSC code is invalid"),
    )),
    upi_id: v.optional(
      v.pipe(v.string("Upi id is required"),v.transform(s => String(s ?? "").trim()),v.nonEmpty("Upi id is required"),
        v.check( s => /^[6-9]\d{9}$/.test(s),"Upi id must be a valid 10-digit mobile number"),
      )),
    })
  ),
  rate_type: v.optional(v.pipe(v.string(), v.transform(val => String(val).toUpperCase()), v.picklist(rateTypeEnum.enumValues, "Invalid rate type"))),
  currency_type: v.optional(v.pipe(v.string(), v.transform(val => String(val).toUpperCase()), v.picklist(currencyTypeEnum.enumValues, "Invalid currency type"), v.transform(val => val ?? "INR"))),
  amount: v.optional(v.pipe(v.number("Amount must be in numbers only"), v.check(n => Number.isInteger(n), "Amount must be an integer"), v.check(n => n >= 0, "Amount cannot be negative")),
  ),
});
export interface PaymentDetails {
  bank_name?: string;
  account_number?: string | number;
  ifsc_code?: string;
  name?: string;
  branch_name?: string;
  upi_id?: string;
}

type Payment = {
  payment_type?: string | null;
  payment_details?: PaymentDetails | null;
};

export type ArtistOut = v.InferOutput<typeof vArtistObject>;
const vArtistPartial = v.partial(vArtistObject);
export type ArtistUpdateOut = v.InferOutput<typeof vArtistPartial>;

function createPaymentChecks<T extends Payment>() {
  return [
    v.check((d: T) =>
      !d.payment_type || d.payment_type !== "BANK" ||
      (d.payment_details !== null && d.payment_details !== undefined),
      "Bank details are required"
    ),

    v.check((d: T) =>
      !d.payment_type || d.payment_type !== "BANK" ||
      !d.payment_details || Boolean(d.payment_details.bank_name),
      "Bank name is required for Bank Transfer"
    ),

    v.check((d: T) =>
      !d.payment_type || d.payment_type !== "BANK" ||
      !d.payment_details || Boolean(d.payment_details.account_number),
      "Account number is required for Bank Transfer"
    ),

    v.check((d: T) =>
      !d.payment_type || d.payment_type !== "BANK" ||
      !d.payment_details || Boolean(d.payment_details.ifsc_code),
      "IFSC code is required for Bank Transfer"
    ),

    v.check((d: T) =>
      !d.payment_type || d.payment_type !== "BANK" ||
      !d.payment_details || Boolean(d.payment_details.name),
      "Name is required for Bank Transfer"
    ),

    v.check((d: T) =>
      !d.payment_type || d.payment_type !== "BANK" ||
      !d.payment_details || Boolean(d.payment_details.branch_name),
      "Branch name is required for Bank Transfer"
    ),

    // UPI rules
    v.check((d: T) =>
      !d.payment_type || d.payment_type !== "UPI" ||
      (d.payment_details !== null && d.payment_details !== undefined),
      "UPI details are required"
    ),

    v.check((d: T) =>
      !d.payment_type || d.payment_type !== "UPI" ||
      !d.payment_details || typeof d.payment_details === "object",
      "Payment details must be an object for UPI Transfer"
    ),

    v.check((d: T) =>
      !d.payment_type || d.payment_type !== "UPI" ||
      !d.payment_details || /^[6-9]\d{9}$/.test(String(d.payment_details.upi_id ?? "")),
      "upi id is invalid"
    ),

    v.check((d: T) =>
      !d.payment_type || d.payment_type !== "UPI" ||
      !d.payment_details || Boolean(d.payment_details.name),
      "Name is required"
    ),

    v.transform((d: T) => {
      const out = { ...(d as object) } as T & { payment_details?: PaymentDetails | null };
      if (out.payment_type === "CASH") {
        out.payment_details = null;
      }
      return out as unknown as T;
    }),
  ];
}

export const paymentChecksCreate = createPaymentChecks<ArtistOut>();
export const paymentChecksUpdate = createPaymentChecks<ArtistUpdateOut>();

export const vArtistSchema = v.pipe(vArtistObject, ...paymentChecksCreate);
export const vArtistUpdateSchema = v.pipe(v.partial(vArtistObject), ...paymentChecksUpdate);

