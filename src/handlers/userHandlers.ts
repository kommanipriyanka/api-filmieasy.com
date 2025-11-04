import type { Context } from "hono";

import { eq, ilike } from "drizzle-orm";

import type { ArtistTable, User } from "../database/schemas";

import { ARTIST_INSERTED, ARTISTS_EXISTS, ARTISTS_FETCHED, USER_FETCHED, USER_ID_REQUIRED, USER_PROJECTS_FETCHED } from "../constants/appMessages";
import { artist_projects, artists } from "../database/schemas";
import BadRequestException from "../exceptions/badRequestException";
import ConflictException from "../exceptions/conflictException";
import factory from "../factory";
import { getPaginationData } from "../helpers/paginationHelpers";
import { getMultipleRecordsByAColumnValue, getRecordsCount, getSingleRecordByAColumnValue, getSingleRecordByMultipleColumnValues, saveRecord, saveRecords } from "../services/baseDbServices";
import { getArtistDetails, getProjects, listArtists } from "../services/userServices";
import { sendResponse } from "../utils/sendResponse";
import { vArtistSchema } from "../validations/artistValidations";
import { validateRequestBody } from "../validations/validateRequest";

import * as xlsx from "xlsx";
 
export class UserHandler {
  inviteArtists = factory.createHandlers(async (c: Context) => {
    const reqData = await c.req.json();
    const user: User = c.get("user_payload");
    const validatedReqData = validateRequestBody(vArtistSchema, reqData);
    const isArtistExists = await getSingleRecordByMultipleColumnValues<ArtistTable>(artists, ["email","invited_by"],["=", "="],[ validatedReqData.email,user.id]);
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
    const user:User= c.get("user_payload")
    const searchString = query.searchString?.trim();
    const filters = [eq(artists.invited_by,user.id)];
    if (searchString) {
      filters.push(ilike(artists.full_name, `%${searchString}%`));
    }
    const [allArtists, totalRecords] = await Promise.all([
      listArtists(page, limit, filters),
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
      getProjects(page, limit, filters),
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
    const user = await getArtistDetails(id)
    return sendResponse(c, 200, USER_FETCHED, user);
  });
  getArtistsDropdown = factory.createHandlers(async (c:Context)=>{
    const user:User = c.get("user_payload");
    const result = await getMultipleRecordsByAColumnValue(artists,"invited_by","=",user.id,["id","full_name"])
    return sendResponse(c,200,ARTISTS_FETCHED,result)
    })


  importArtists = factory.createHandlers(async (c:Context) => {
    const body = await c.req.parseBody();
    const file = body.file as File;
    if (!file) {
      return sendResponse(c, 400, "No file uploaded");
    }
    const user:User = c.get("user_payload")
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = xlsx.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    const formattedRows = rows.map((row: any) => ({
      full_name: row.full_name?.trim(),
      department_id: row.department_id ? Number(row.department_id) : null,
      email: row.email?.trim(),
    }));
    const recordsToInsert = formattedRows.map(r => ({ ...r, invited_by: user.id }));
    await saveRecords<ArtistTable>(artists, recordsToInsert);
    return sendResponse(c, 200, "Excel records imported successfully", { insertedRecords: recordsToInsert.length });
});
}

