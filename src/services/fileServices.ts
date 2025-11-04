import { GetObjectCommand,  PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, bucketName } from "../config/s3Config";

export class s3Service{
  getPresignedUploadUrl = async (path: string, contentType: string) => {
    const key = `filmieasy/${path}`; 
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
    return { uploadUrl, path:key };
  };

  getPresignedDownloadUrl =  (key: string): Promise<string> => {
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
    return   getSignedUrl(s3, command, { expiresIn: 900 });
  };
}
