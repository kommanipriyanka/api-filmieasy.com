import factory from "../factory";
import { UserHandler } from "../handlers/userHandlers";
import { isAuthorized } from "../middlewares/isAuthorized";

const userHandler = new UserHandler();
export const userRoutes = factory.createApp();

userRoutes.post("/", isAuthorized, ...userHandler.inviteArtists);
userRoutes.get("/", isAuthorized, ...userHandler.getArtists);
userRoutes.get("/:id", ...userHandler.getArtist);
userRoutes.get("/:id/projects", ...userHandler.getArtistProjects);
