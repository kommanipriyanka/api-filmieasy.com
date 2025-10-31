import factory from "../factory";
import { ProjectHandler } from "../handlers/projectHandlers";
import { isAuthorized } from "../middlewares/isAuthorized";

const projectHandler = new ProjectHandler();

export const projectRoutes = factory.createApp();
projectRoutes.post("/", isAuthorized, ...projectHandler.createProject);
projectRoutes.get("/",...projectHandler.getAllProjects)
projectRoutes.get("/:id/users", ...projectHandler.getProjectUsers);
projectRoutes.get("/:id",...projectHandler.getProjectDetails)
