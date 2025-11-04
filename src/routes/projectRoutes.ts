import factory from "../factory";
import { ProjectHandler } from "../handlers/projectHandlers";
import { SceneHandler } from "../handlers/sceneHandlers";
import { isAuthorized } from "../middlewares/isAuthorized";

const projectHandler = new ProjectHandler();
const sceneHandler = new SceneHandler();



export const projectRoutes = factory.createApp();
projectRoutes.post("/", isAuthorized, ...projectHandler.createProject);
projectRoutes.get("/",isAuthorized,...projectHandler.getAllProjects)
projectRoutes.get("/:id/users", ...projectHandler.getProjectUsers);
projectRoutes.get("/:id",...projectHandler.getProjectDetails)
projectRoutes.post("/:id/scene",...sceneHandler.createScene)
projectRoutes.get("/:id/scenes",...sceneHandler.getSceneDetails)
