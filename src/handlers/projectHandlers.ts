import type { Context } from "hono";

import { eq } from "drizzle-orm";

import type { ArtistProjectTable } from "../database/schemas/artistProjects";
import type { ProjectTable } from "../database/schemas/projects";
import type { User } from "../database/schemas/users";

import { PROJECT_CREATED, PROJECT_ID_REQUIRED, PROJECT_USERS_FETCHED } from "../constants/appMessages";
import { artistProjects } from "../database/schemas/artistProjects";
import { projects } from "../database/schemas/projects";
import BadRequestException from "../exceptions/badRequestException";
import factory from "../factory";
import { getPaginationData } from "../helpers/paginationHelpers";
import { getRecordsCount, saveRecord, saveRecords } from "../services/baseDbServices";
import { getUsers } from "../services/projectServices";
import { sendResponse } from "../utils/sendResponse";
import { vCreateProject } from "../validations/projectValidations";
import { validateRequestBody } from "../validations/validateRequest";

export class ProjectHandler {
  createProject = factory.createHandlers(async (c: Context) => {
    const user: User = c.get("user_payload");
    const reqData = await c.req.json();
    const validatedReqData = validateRequestBody(vCreateProject, reqData);
    const project = await saveRecord<ProjectTable>(projects, { ...validatedReqData, created_by: user.id });
    if (validatedReqData.users && validatedReqData.users.length > 0) {
      const records = validatedReqData.users.map((userId: number) => ({ artist_id: userId, project_id: project.id }));
      await saveRecords<ArtistProjectTable>(artistProjects, records);
    }
    return sendResponse(c, 200, PROJECT_CREATED, project);
  });

  getProjectUsers = factory.createHandlers(async (c: Context) => {
    const id = +c.req.param("id");
    const page = +(c.req.query("page") || 1);
    const limit = +(c.req.query("limit") || 10);
    if (!id)
      throw new BadRequestException(PROJECT_ID_REQUIRED);
    const filters = [eq(artistProjects.project_id, id)];
    const [records, totalRecords] = await Promise.all([
      getUsers(id, page, limit),
      getRecordsCount(artistProjects, filters),
    ]);
    const pagination_info = getPaginationData(page, limit, totalRecords);
    const response = { pagination_info, records };
    return sendResponse(c, 200, PROJECT_USERS_FETCHED, response);
  });
}
