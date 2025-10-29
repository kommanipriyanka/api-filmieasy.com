import factory from "../factory";
import { AuthHandler } from "../handlers/authHandlers";
import { isAuthorized } from "../middlewares/isAuthorized";

const authHandler = new AuthHandler();
export const authRoutes = factory.createApp();
authRoutes.post("/signup", ...authHandler.signUp);
authRoutes.post("/login", ...authHandler.login);
