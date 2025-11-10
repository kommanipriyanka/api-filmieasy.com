import factory from "../factory";
import { getDummyArtist, getDummyArtistProjects, getDummyArtists, getDummyProject, getDummyProjectPayments, getDummyProjects, getDummyProjectSceneById, getDummyProjectScenes, getDummyProjectUsers } from "../handlers/dummyHandlers";

export const dummyRoutes = factory.createApp();
dummyRoutes.get("/artists", ...getDummyArtists);
dummyRoutes.get("/projects", ...getDummyProjects);
dummyRoutes.get("/artists/:id", ...getDummyArtist);
dummyRoutes.get("/artists/:id/projects", ...getDummyArtistProjects);
dummyRoutes.get("/projects/:id", ...getDummyProject);
dummyRoutes.get("/projects/:id/users", ...getDummyProjectUsers);
dummyRoutes.get("/projects/:id/scenes", ...getDummyProjectScenes);
dummyRoutes.get("/projects/:id/scenes/:sceneId", ...getDummyProjectSceneById);
dummyRoutes.get("/projects/:id/payments", ...getDummyProjectPayments);
