import factory from "../factory";
import { UserHandler } from "../handlers/userHandlers";

const userHandler = new UserHandler();
export const userRoutes = factory.createApp();
userRoutes.post("/", ...userHandler.signUp);
userRoutes.post("/login", ...userHandler.login);
