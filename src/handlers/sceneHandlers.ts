import type { Context } from "hono";

import type { ArtistSceneTable, newArtistScene } from "../database/schemas/artistScenes";
import type { SceneTable } from "../database/schemas/scenes";

import { PROJECT_ID_REQUIRED, PROJECT_SCENES_FETCHED, SCENE_CREATED, SCENE_ID_REQUIRED, SCENE_MEMBERS } from "../constants/appMessages";
import { artist_scenes } from "../database/schemas/artistScenes";
import { scenes } from "../database/schemas/scenes";
import BadRequestException from "../exceptions/badRequestException";
import factory from "../factory";
import { getSingleRecordByAColumnValue, saveRecord, saveRecords } from "../services/baseDbServices";
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
    const scene = await saveRecord<SceneTable>(scenes, { ...validatedReqData, project_id: id });
    if (validatedReqData.scene_members && validatedReqData.scene_members.length > 0) {
      const records: newArtistScene[] = validatedReqData.scene_members.map((artistId: number) => ({
        artist_id: artistId,
        scene_id: scene.id,
      }));
      await saveRecords<ArtistSceneTable>(artist_scenes, records);
    }
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
    const scene_members = await sceneService.getScenes(projectId);
    return sendResponse(c, 200, SCENE_MEMBERS, scene_members);
  });
}
