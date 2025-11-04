import { Context } from "hono";
import factory from "../factory";
import { s3Service } from "../services/fileServices";
import { fileNameHelper } from "../helpers/fileNameHelpers";
import { DOWNLOAD_URL, UPLOAD_URL } from "../constants/appMessages";
import { sendResponse } from "../utils/sendResponse";
import { vSignedUrl } from "../validations/fileValidations";
import { validateRequestBody } from "../validations/validateRequest";
const S3Service = new s3Service();


export class FileHandler {
    
    getSignedUrl = factory.createHandlers(async (c:Context)=>{
        const reqData = await c.req.json();
        const validatedReqData = validateRequestBody(vSignedUrl,reqData)
        const path = fileNameHelper(validatedReqData.name)
        const result = await S3Service.getPresignedUploadUrl(path,validatedReqData.contentType)
        return sendResponse(c,200,UPLOAD_URL,result)
    })

    getDownloadUrl = factory.createHandlers(async (c:Context)=>{
        const body  = await c.req.json()
        const result = await S3Service.getPresignedDownloadUrl(body.key);
        return sendResponse(c,200,DOWNLOAD_URL,result)
    })
}