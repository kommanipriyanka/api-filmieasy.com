import { Context } from "hono";
import factory from "../factory";
import {  scenes, SceneTable } from "../database/schemas/scenes";
import { saveRecord, saveRecords } from "../services/baseDbServices";
import { sendResponse } from "../utils/sendResponse";
import { PROJECT_ID_REQUIRED, SCENE_CREATED } from "../constants/appMessages";
import { validateRequestBody } from "../validations/validateRequest";
import { vCreateScene } from "../validations/sceneValidations";
import BadRequestException from "../exceptions/badRequestException";
import { artistScenes, ArtistSceneTable, newArtistScene } from "../database/schemas/artistScenes";




export class SceneHandler{
    createScene = factory.createHandlers(async (c:Context)=>{
        const reqData = await c.req.json(); 
        const id = +c.req.param("id");
        if(!id) throw new BadRequestException(PROJECT_ID_REQUIRED)
        const validatedReqData = validateRequestBody(vCreateScene,reqData)
        const scene = await saveRecord<SceneTable>(scenes,{...validatedReqData,project_id:id})
        if (validatedReqData.scene_members && validatedReqData.scene_members.length > 0) {
            const records: newArtistScene[] = validatedReqData.scene_members.map((userId: number) => ({
                user_id: userId,
                scene_id: scene.id,
            }));
        await saveRecords<typeof artistScenes>(artistScenes, records);
        }
        return sendResponse(c,200,SCENE_CREATED,scene)

    })

}