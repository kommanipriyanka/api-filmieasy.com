 import factory from "../factory";
 import { SceneHandler } from "../handlers/sceneHandlers";

 const sceneHandler = new SceneHandler();
 export const sceneRoutes = factory.createApp();
// sceneRoutes.post("/",...sceneHandler.createScene)
sceneRoutes.get("/:id",...sceneHandler.getAllScenes)