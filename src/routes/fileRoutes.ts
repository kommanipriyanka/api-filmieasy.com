import factory from "../factory";
import { FileHandler } from "../handlers/fileHandlers";

export const fileRoutes = factory.createApp();
const fileHandler = new FileHandler()

fileRoutes.post("/signed-url",...fileHandler.getSignedUrl)
fileRoutes.post("/download",...fileHandler.getDownloadUrl)
