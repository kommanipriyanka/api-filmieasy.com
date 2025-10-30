import type { Context } from "hono";

import { eq, ilike } from "drizzle-orm";

import type { ArtistTable, User } from "../database/schemas";

import { ARTIST_INSERTED, ARTISTS_EXISTS, ARTISTS_FETCHED, USER_FETCHED, USER_ID_REQUIRED, USER_PROJECTS_FETCHED } from "../constants/appMessages";
import { artistProjects, artists } from "../database/schemas";
import BadRequestException from "../exceptions/badRequestException";
import ConflictException from "../exceptions/conflictException";
import factory from "../factory";
import { getPaginationData } from "../helpers/paginationHelpers";
import { getRecordsCount, getSingleRecordByAColumnValue, saveRecord } from "../services/baseDbServices";
import { getProjects, listArtists } from "../services/userServices";
import { sendResponse } from "../utils/sendResponse";
import { vArtistSchema } from "../validations/artistValidations";
import { validateRequestBody } from "../validations/validateRequest";

export class UserHandler {
  inviteArtists = factory.createHandlers(async (c: Context) => {
    const reqData = await c.req.json();
    const user: User = c.get("user_payload");
    const validatedReqData = validateRequestBody(vArtistSchema, reqData);
    const isArtistExists = await getSingleRecordByAColumnValue<ArtistTable>(artists, "email", "=", validatedReqData.email);
    if (isArtistExists) {
      throw new ConflictException(ARTISTS_EXISTS);
    }
    const artistsData = await saveRecord(artists, { ...validatedReqData, invited_by: user.id });
    return sendResponse(c, 200, ARTIST_INSERTED, artistsData);
  });

  getArtists = factory.createHandlers(async (c: Context) => {
    const query = c.req.query();
    const page = +query.page || 1;
    const limit = +query.pageSize || 10;
    const departmentId = query.departmentId ? Number(query.departmentId) : undefined;
    const searchString = query.searchString?.trim();
    const filters = [];
    if (departmentId) {
      filters.push(eq(artists.department_id, departmentId));
    }
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

  getUserProjects = factory.createHandlers(async (c: Context) => {
    const id = +c.req.param("id");
    const page = +(c.req.query("page") || 1);
    const limit = +(c.req.query("limit") || 10);
    if (!id)
      throw new BadRequestException(USER_ID_REQUIRED);
    const filters = [eq(artistProjects.artist_id, id)];

    const [records, totalRecords] = await Promise.all([
      getProjects(page, limit, id),
      getRecordsCount(artistProjects, filters),
    ]);
    const pagination_info = getPaginationData(page, limit, totalRecords);
    const response = { pagination_info, records };
    return sendResponse(c, 200, USER_PROJECTS_FETCHED, response);
  });

  getUser = factory.createHandlers(async (c: Context) => {
    const id = +c.req.param("id");
    if (!id)
      throw new BadRequestException(USER_ID_REQUIRED);
    const user = await getSingleRecordByAColumnValue(artists, "id", "=", id);
    return sendResponse(c, 200, USER_FETCHED, user);
  });
}
