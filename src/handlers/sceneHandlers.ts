import { Context } from "hono";
import factory from "../factory";
import {  scenes, SceneTable } from "../database/schemas/scenes";
import { saveRecord } from "../services/baseDbServices";
import { sendResponse } from "../utils/sendResponse";
import { SCENE_CREATED } from "../constants/appMessages";




export class SceneHandler{
    createScene = factory.createHandlers(async (c:Context)=>{
        const reqData = await c.req.json(); 
        const scene = await saveRecord<SceneTable>(scenes,reqData)
        return sendResponse(c,200,SCENE_CREATED,scene)

    })

}