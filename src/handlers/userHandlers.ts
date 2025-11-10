import type { Context } from "hono";

import { eq, ilike } from "drizzle-orm";
import * as xlsx from "xlsx";

import type { ArtistTable, User } from "../database/schemas";

import { ARTIST_INSERTED, ARTISTS_EXISTS, ARTISTS_FETCHED, USER_FETCHED, USER_ID_REQUIRED, USER_PROJECTS_FETCHED } from "../constants/appMessages";
import db from "../database/db";
import { artist_projects, artists } from "../database/schemas";
import BadRequestException from "../exceptions/badRequestException";
import ConflictException from "../exceptions/conflictException";
import factory from "../factory";
import { getPaginationData } from "../helpers/paginationHelpers";
import { getMultipleRecordsByAColumnValue, getRecordsCount, getSingleRecordByMultipleColumnValues, saveRecord } from "../services/baseDbServices";
import { UserService } from "../services/userServices";
import { sendResponse } from "../utils/sendResponse";
import { vArtistSchema } from "../validations/artistValidations";
import { validateRequestBody } from "../validations/validateRequest";

const userService = new UserService();

export class UserHandler {
  inviteArtists = factory.createHandlers(async (c: Context) => {
    const reqData = await c.req.json();
    const user: User = c.get("user_payload");
    const validatedReqData = validateRequestBody(vArtistSchema, reqData);
    const isArtistExists = await getSingleRecordByMultipleColumnValues<ArtistTable>(artists, ["email", "invited_by"], ["=", "="], [validatedReqData.email, user.id]);
    if (isArtistExists) {
      throw new ConflictException(ARTISTS_EXISTS);
    }
    const artistsData = await saveRecord<ArtistTable>(artists, { ...validatedReqData, invited_by: user.id });
    return sendResponse(c, 200, ARTIST_INSERTED, artistsData);
  });

  getArtists = factory.createHandlers(async (c: Context) => {
    const query = c.req.query();
    const page = +query.page || 1;
    const limit = +query.pageSize || 10;
    const user: User = c.get("user_payload");
    const searchString = query.searchString?.trim();
    const filters = [eq(artists.invited_by, user.id)];
    if (searchString) {
      filters.push(ilike(artists.full_name, `%${searchString}%`));
    }
    const [allArtists, totalRecords] = await Promise.all([
      userService.listArtists(page, limit, filters),
      getRecordsCount(artists, filters),
    ]);
    const pagination_info = getPaginationData(page, limit, totalRecords);
    const response = { pagination_info, records: allArtists };
    return sendResponse(c, 200, ARTISTS_FETCHED, response);
  });

  getArtistProjects = factory.createHandlers(async (c: Context) => {
    const id = +c.req.param("id");
    const page = +(c.req.query("page") || 1);
    const limit = +(c.req.query("limit") || 10);
    if (!id)
      throw new BadRequestException(USER_ID_REQUIRED);
    const filters = [eq(artist_projects.artist_id, id)];

    const [records, totalRecords] = await Promise.all([
      userService.getProjects(page, limit, filters),
      getRecordsCount(artist_projects, filters),
    ]);
    const pagination_info = getPaginationData(page, limit, totalRecords);
    const response = { pagination_info, records };
    return sendResponse(c, 200, USER_PROJECTS_FETCHED, response);
  });

  getArtist = factory.createHandlers(async (c: Context) => {
    const id = +c.req.param("id");
    if (!id)
      throw new BadRequestException(USER_ID_REQUIRED);
    const user = await userService.getArtistDetails(id);
    return sendResponse(c, 200, USER_FETCHED, user);
  });

  getArtistsDropdown = factory.createHandlers(async (c: Context) => {
    const user: User = c.get("user_payload");
    const result = await getMultipleRecordsByAColumnValue(artists, "invited_by", "=", user.id, ["id", "full_name"]);
    return sendResponse(c, 200, ARTISTS_FETCHED, result);
  });

  importArtists = factory.createHandlers(async (c: Context) => {
    const body = await c.req.parseBody();
    const file = body.file as File;
    if (!file) {
      return sendResponse(c, 400, "No file uploaded");
    }
    const user: User = c.get("user_payload");
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = xlsx.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    const records = rows
      .filter((r: any) => r && r.email)
      .map((r: any) => ({
        full_name: r.full_name?.trim() || null,
        email: r.email?.trim(),
        phone: r.phone ? String(r.phone).trim() : null,
        gender: r.gender?.trim() || null,
        role_type: r.role_type?.trim() || null,
        department_id: r.department_id ? Number(r.department_id) : null,
        DOB: r.DOB || null,
        address: r.address?.trim() || null,
        languages: r.languages
          ? r.languages.split(",").map((lang: string) => lang.trim()).filter(Boolean)
          : null,
        invited_by: user.id,
      }));
    if (records.length === 0) {
      return sendResponse(c, 400, "No valid data found in Excel file");
    }
    const result = await userService.importArtistsService(records);
    return sendResponse(c, 200, "Excel records imported successfully", {
      insertedCount: result.insertedRecords,
      skippedCount: result.skippedDuplicates,
    });
  });

  downloadArtists = factory.createHandlers(async (c: Context) => {
    const user: User = c.get("user_payload");

    const records = await db
      .select()
      .from(artists)
      .where(eq(artists.invited_by, user.id));

    if (!records || records.length === 0) {
      return sendResponse(c, 404, "No artists found to download");
    }

    const worksheet = xlsx.utils.json_to_sheet(records);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Artists");

    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
    c.header("Content-Disposition", "attachment; filename=artists.xlsx");
    c.header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return new Response(buffer, { status: 200 });
  });
}
