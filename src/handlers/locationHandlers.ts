import type { LocationTable } from "../database/schemas/location";

import { LOCATION_CREATED, LOCATIONS_FETCHED } from "../constants/appMessages";
import { location } from "../database/schemas/location";
import factory from "../factory";
import { getRecordsConditionally, saveRecord } from "../services/baseDbServices";
import { sendResponse } from "../utils/sendResponse";

export class LocationHandler {
  createLocation = factory.createHandlers(async (c) => {
    const reqData = await c.req.json();
    // const validatedReqData = await validateRequestBody()
    const result = await saveRecord<LocationTable>(location, reqData);
    return sendResponse(c, 200, LOCATION_CREATED, result);
  });

  getAllLocations = factory.createHandlers(async (c) => {
    const result = await getRecordsConditionally(location);
    return sendResponse(c, 200, LOCATIONS_FETCHED, result);
  });
}
