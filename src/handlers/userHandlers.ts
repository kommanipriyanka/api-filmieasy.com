import { Context } from "hono";
import factory from "../factory";
import { artists, ArtistTable, User } from "../database/schemas";
import { validateRequestBody } from "../validations/validateRequest";
import { vArtistSchema } from "../validations/artistValidations";
import { getRecordsCount, getSingleRecordByAColumnValue, saveRecord } from "../services/baseDbServices";
import ConflictException from "../exceptions/conflictException";
import { sendResponse } from "../utils/sendResponse";
import { ARTIST_INSERTED, ARTISTS_EXISTS, ARTISTS_FETCHED } from "../constants/appMessages";
import { eq } from "drizzle-orm";
import { listArtists } from "../services/userServices";
import { getPaginationData } from "../helpers/paginationHelpers";

export class UserHandler{
    inviteArtists = factory.createHandlers(async (c: Context) => {
    const reqData = await c.req.json();
    const user: User = c.get("user_payload");
    const validatedReqData = validateRequestBody(vArtistSchema, reqData);
    const isArtistExists = await getSingleRecordByAColumnValue<ArtistTable>(artists, "full_name", "=", validatedReqData.full_name);
    if (isArtistExists) {
      throw new ConflictException(ARTISTS_EXISTS);
    }
    const artistsData = await saveRecord(artists, { ...validatedReqData, invited_by: user.id });
    return sendResponse(c, 200, ARTIST_INSERTED, artistsData);
  });

  getArtists = factory.createHandlers(async (c: Context) => {
    const query = c.req.query();
    const page = +query.page || 1;
    const limit = +query.limit || 10;
    const departmentId = query.departmentId ? Number(query.departmentId) : undefined;
    const filters = departmentId ? [eq(artists.department_id, departmentId)] : [];
    const [allArtists, totalRecords] = await Promise.all([
      listArtists(page, limit, filters),
      getRecordsCount(artists, filters),
    ]);
    const pagination_info = getPaginationData(page, limit, totalRecords);
    const response = { pagination_info, records: allArtists };
    return sendResponse(c, 200, ARTISTS_FETCHED, response);
  });
}
