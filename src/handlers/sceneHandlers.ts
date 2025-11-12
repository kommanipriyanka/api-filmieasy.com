import type { Context } from "hono";

import { eq } from "drizzle-orm";

import { PROJECT_ID_REQUIRED, PROJECT_SCENES_FETCHED, SCENE_CREATED, SCENE_ID_REQUIRED } from "../constants/appMessages";
import { scenes } from "../database/schemas/scenes";
import BadRequestException from "../exceptions/badRequestException";
import factory from "../factory";
import { getPaginationData } from "../helpers/paginationHelpers";
import { getRecordsCount, getSingleRecordByAColumnValue } from "../services/baseDbServices";
import { SceneService } from "../services/sceneServices";
import { sendResponse } from "../utils/sendResponse";
import { vCreateScene } from "../validations/sceneValidations";
import { validateRequestBody } from "../validations/validateRequest";

const sceneService = new SceneService();

export class SceneHandler {
  createScene = factory.createHandlers(async (c: Context) => {
    const reqData = await c.req.json();
    const id = +c.req.param("id");
    if (!id)
      throw new BadRequestException(PROJECT_ID_REQUIRED);
    const validatedReqData = validateRequestBody(vCreateScene, reqData);
    const scene = await sceneService.createScenes(validatedReqData, id);
    return sendResponse(c, 200, SCENE_CREATED, scene);
  });

  getSceneDetails = factory.createHandlers(async (c: Context) => {
    const projectId = c.req.param("id");
    if (!projectId)
      throw new BadRequestException(PROJECT_ID_REQUIRED);
    const result = await getSingleRecordByAColumnValue(scenes, "project_id", "=", projectId);
    return sendResponse(c, 200, PROJECT_SCENES_FETCHED, result);
  });

  getAllScenes = factory.createHandlers(async (c: Context) => {
    const projectId = +c.req.param("id");
    if (!projectId)
      throw new BadRequestException(SCENE_ID_REQUIRED);
    const page = +(c.req.query("page") || 1);
    const limit = +(c.req.query("limit") || 10);
    const [project_scenes, total_records] = await Promise.all([sceneService.getScenes(projectId, page, limit), getRecordsCount(scenes, [eq(scenes.project_id, projectId)])]);
    const pagination_info = getPaginationData(page, limit, total_records);
    return sendResponse(c, 200, PROJECT_SCENES_FETCHED, { pagination_info, project_scenes });
  });
}
