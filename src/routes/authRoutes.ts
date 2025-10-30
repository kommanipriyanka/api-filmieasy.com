import factory from "../factory";
import { AuthHandler } from "../handlers/authHandlers";

const authHandler = new AuthHandler();
export const authRoutes = factory.createApp();
authRoutes.post("/signup", ...authHandler.signUp);
authRoutes.post("/login", ...authHandler.login);
