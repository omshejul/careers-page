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
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || "auto", // "auto" works for Cloudflare R2, or specify region for AWS S3
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
});


