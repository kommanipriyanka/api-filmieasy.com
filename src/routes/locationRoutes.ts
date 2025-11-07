import factory from "../factory";
import { LocationHandler } from "../handlers/locationHandlers";

const locationHandler = new LocationHandler();

export const locationRoutes = factory.createApp();
locationRoutes.post("/",...locationHandler.createLocation);
locationRoutes.get("/",...locationHandler.getAllLocations);