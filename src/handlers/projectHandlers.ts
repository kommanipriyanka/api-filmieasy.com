import type { Context } from "hono";

import { eq } from "drizzle-orm";

import { User, users } from "../database/schemas/users";

import { PROJECT_CREATED, PROJECT_DETAILS, PROJECT_ID_REQUIRED, PROJECT_NOT_FOUND, PROJECT_UPDATED, PROJECT_USERS_FETCHED, PROJECTS_FETCHED, USER_NOT_FOUND } from "../constants/appMessages";
import { artist_projects } from "../database/schemas/artistProjects";
import { projects } from "../database/schemas/projects";
import BadRequestException from "../exceptions/badRequestException";
import NotFoundException from "../exceptions/notFoundException";
import factory from "../factory";
import { getPaginationData } from "../helpers/paginationHelpers";
import {  getMultipleRecordsByMultipleColumnValues, getRecordById, getRecordsCount, getSingleRecordByAColumnValue, updateRecordById } from "../services/baseDbServices";
import { S3Service } from "../services/fileServices";
import { sendResponse } from "../utils/sendResponse";
import { vCreateProjectWithScenes, vUpdateProject } from "../validations/projectValidations";
import { validateRequestBody } from "../validations/validateRequest";
import { scenes } from "../database/schemas/scenes";
import { createProjectWithScenes, getUsers, listProjects, updateProjectWithTeamMembers } from "../services/projectServices";

const s3Service = new S3Service();

export class ProjectHandler {
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

  getProjectDetails = factory.createHandlers(async (c: Context) => {
    const id = +c.req.param("id");
    if (!id)
      throw new BadRequestException(PROJECT_ID_REQUIRED);
    const project = await getSingleRecordByAColumnValue(projects, "id", "=", id);
    if (!project)
      throw new NotFoundException(PROJECT_NOT_FOUND);
    let project_logo_url: string | null = null;
    if (project.project_logo) {
      project_logo_url = await s3Service.getPresignedDownloadUrl(project.project_logo);
    }
    return sendResponse(c, 200, PROJECT_DETAILS, { project_logo_url, ...project });
  });

  getAllProjects = factory.createHandlers(async (c: Context) => {
    const userId = +c.get("user_payload").id;
    const page = Number(c.req.query("page") || 1);
    const limit = Number(c.req.query("pageSize") || 10);
    const searchString = c.req.query("searchString");
    const user = await getRecordById(users,userId)
    if(!user) throw new NotFoundException(USER_NOT_FOUND)
    const { total_records, result } = await listProjects(page, limit, userId, searchString);
    const pagination_info = getPaginationData(page, limit, total_records);
    const paginatedResponse = { pagination_info, records: result };
    return sendResponse(c, 200, PROJECTS_FETCHED, paginatedResponse);
  });

  createProjectWithScenes = factory.createHandlers(async (c: Context) => {
    const user: User = c.get("user_payload");
    const reqData = await c.req.json();
    const validatedData = validateRequestBody(vCreateProjectWithScenes, reqData);
    const result = await createProjectWithScenes(user.id, validatedData);
    return sendResponse(c, 200, PROJECT_CREATED, result);
  });

 updateProject = factory.createHandlers(async (c: Context) => {
  const projectId = +c.req.param("id");
  const reqData = await c.req.json();
  const validatedReqData = validateRequestBody(vUpdateProject, reqData);
  const { team_members_add, team_members_remove, ...projectData } =validatedReqData;
  const project = await getRecordById(projects,projectId);
  if (!project) throw new NotFoundException(PROJECT_NOT_FOUND);
  const result = await updateProjectWithTeamMembers(projectId,projectData,team_members_add,team_members_remove);
  if (result?.error === "HAS_SCENES") {
    throw new BadRequestException(`Cannot remove members assigned to scenes`);
  }
  return sendResponse(c, 200, PROJECT_UPDATED, result);
});


} 
