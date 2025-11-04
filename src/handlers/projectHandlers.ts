import type { Context } from "hono";

import { eq } from "drizzle-orm";

import type { ArtistProjectTable } from "../database/schemas/artistProjects";
import type { ProjectTable } from "../database/schemas/projects";
import type { User } from "../database/schemas/users";

import { PROJECT_CREATED, PROJECT_DETAILS, PROJECT_ID_REQUIRED, PROJECT_USERS_FETCHED, PROJECTS_FETCHED } from "../constants/appMessages";
import { artist_projects } from "../database/schemas/artistProjects";
import { projects } from "../database/schemas/projects";
import BadRequestException from "../exceptions/badRequestException";
import factory from "../factory";
import { getPaginationData } from "../helpers/paginationHelpers";
import { getRecordsCount, getSingleRecordByAColumnValue, saveRecord, saveRecords } from "../services/baseDbServices";
import {  getUsers, listProjects } from "../services/projectServices";
import { sendResponse } from "../utils/sendResponse";
import { vCreateProject} from "../validations/projectValidations";
import { validateRequestBody } from "../validations/validateRequest";
import { isAuthorized } from "../middlewares/isAuthorized";

export class ProjectHandler {
  createProject = factory.createHandlers(isAuthorized,async (c: Context) => {
    const user:User= c.get("user_payload");
    const reqData = await c.req.json();
    const validatedReqData = validateRequestBody(vCreateProject, reqData);
    const project = await saveRecord<ProjectTable>(projects, { ...validatedReqData, created_by: user.id });
    if (validatedReqData.team_members && validatedReqData.team_members.length > 0) {
      const records = validatedReqData.team_members.map((userId: number) => ({ artist_id: userId, project_id: project.id }));
      await saveRecords<ArtistProjectTable>(artist_projects, records);
    }
    return sendResponse(c, 200, PROJECT_CREATED, project);
  });

  getProjectUsers = factory.createHandlers(async (c: Context) => {
    const id = +c.req.param("id");
    const page = +(c.req.query("page") || 1);
    const limit = +(c.req.query("limit") || 10);
    if (!id)
      throw new BadRequestException(PROJECT_ID_REQUIRED);
    const filters = [eq(artist_projects.project_id, id)];
    const [records, totalRecords] = await Promise.all([
      getUsers(id, page, limit),
      getRecordsCount(artist_projects, filters),
    ]);
    const pagination_info = getPaginationData(page, limit, totalRecords);
    const response = { pagination_info, records };
    return sendResponse(c, 200, PROJECT_USERS_FETCHED, response);
  });

  getProjectDetails = factory.createHandlers(async (c:Context)=>{
    const id = +c.req.param("id");
    if(!id) throw new BadRequestException(PROJECT_ID_REQUIRED)
    const result = await getSingleRecordByAColumnValue(projects,"id","=",id)
    return sendResponse(c,200,PROJECT_DETAILS,result)
  })


  getAllProjects = factory.createHandlers(async (c:Context)=>{
    const userId = +c.get("user_payload").id;
    const page = Number(c.req.query("page") || 1);
    const limit = Number(c.req.query("pageSize") || 10);
    const searchString=c.req.query("searchString");
    const {total_records,result} = await listProjects(page,limit,userId,searchString)
    const pagination_info = getPaginationData(page,limit,total_records)
    const paginatedResponse = {pagination_info,records:result}
    return sendResponse(c,200,PROJECTS_FETCHED,paginatedResponse)
  })

  
}