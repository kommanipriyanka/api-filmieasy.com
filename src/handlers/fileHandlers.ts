import type { Context } from "hono";

import { DOWNLOAD_URL, UPLOAD_URL } from "../constants/appMessages";
import factory from "../factory";
import { fileNameHelper } from "../helpers/fileNameHelpers";
import { S3Service } from "../services/fileServices";
import { sendResponse } from "../utils/sendResponse";
import { vSignedUrl } from "../validations/fileValidations";
import { validateRequestBody } from "../validations/validateRequest";

const s3Service = new S3Service();

export class FileHandler {
  getSignedUrl = factory.createHandlers(async (c: Context) => {
    const reqData = await c.req.json();
    const validatedReqData = validateRequestBody(vSignedUrl, reqData);
    const path = fileNameHelper(validatedReqData.name);
    const result = await s3Service.getPresignedUploadUrl(path, validatedReqData.contentType);
    return sendResponse(c, 200, UPLOAD_URL, result);
  });

  getDownloadUrl = factory.createHandlers(async (c: Context) => {
    const body = await c.req.json();
    const result = await s3Service.getPresignedDownloadUrl(body.key);
    return sendResponse(c, 200, DOWNLOAD_URL, result);
  });
}
