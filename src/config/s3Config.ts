import { S3Client } from '@aws-sdk/client-s3';


export const s3 = new S3Client({
  region: 'us-east-005',
  endpoint: 'https://s3.us-east-005.backblazeb2.com',
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APP_KEY!,
  },
  forcePathStyle: false,
});

export const bucketName = process.env.B2_BUCKET_NAME!
