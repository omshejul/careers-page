import { S3Client } from "@aws-sdk/client-s3";

if (!process.env.S3_ENDPOINT) {
    throw new Error("Missing env.S3_ENDPOINT");
}

if (!process.env.S3_ACCESS_KEY_ID) {
    throw new Error("Missing env.S3_ACCESS_KEY_ID");
}

if (!process.env.S3_SECRET_ACCESS_KEY) {
    throw new Error("Missing env.S3_SECRET_ACCESS_KEY");
}

export const s3Client = new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
});


