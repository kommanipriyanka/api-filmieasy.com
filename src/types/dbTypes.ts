import type { PgInsertValue } from "drizzle-orm/pg-core";

import type { Artist, ArtistTable } from "../database/schemas/artists";
import type { Department, DepartmentTable } from "../database/schemas/department";
import type { User, UserTable } from "../database/schemas/users";

export type DBTable = UserTable | DepartmentTable | ArtistTable;

export type DBRecord<T extends DBTable>
  = T extends UserTable ? User
    : T extends DepartmentTable ? Department
      : T extends ArtistTable ? Artist : null;

export type DBNewRecord<T extends DBTable> = PgInsertValue<T>;

export type DBTableColumns<T extends DBTable> = keyof DBRecord<T>;

export type SortDirection = "asc" | "desc";

export type Relations = "=" | "!=" | "<" | "<=" | ">" | ">=" | "ILIKE" | "BETWEEN" | "IN" | "IS NULL" | "@>" | "contains" | "IS NOT NULL" | "OR";

export interface WhereQueryData<T extends DBTable> {
  columns: Array<keyof DBRecord<T>>;
  relations: Array<Relations>;
  values: any[];
}

export interface OrderByQueryData<T extends DBTable> {
  columns: Array<DBTableColumns<T>>;
  values: SortDirection[];
}

export interface InQueryData<T extends DBTable> {
  key: keyof DBRecord<T>;
  values: any[];
}

export type UpdateRecordData<T extends DBTable> = Partial<Omit<DBRecord<T>, "id" | "created_at" | "updated_at">>;

export interface PaginationInfo {
  total_records: number;
  total_pages: number;
  page_size: number;
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
}

export interface PaginatedRecords<T extends DBTable> {
  pagination_info: PaginationInfo;
  records: DBRecord<T>[];
}
