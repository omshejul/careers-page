import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./storage";

export async function uploadFileToStorage(
  file: File,
  path: string,
  bucket: string = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "company-assets",
): Promise<string> {
  try {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3-compatible storage
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: path,
      Body: buffer,
      ContentType: file.type,
      CacheControl: "max-age=3600",
    });

    await s3Client.send(command);

    // Construct public URL from generic S3 endpoint
    const baseUrl =
      process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL || process.env.S3_PUBLIC_BASE_URL;
    if (!baseUrl) {
      throw new Error("Missing S3 public base URL (NEXT_PUBLIC_S3_PUBLIC_BASE_URL or S3_PUBLIC_BASE_URL)");
    }

    const publicUrl = `${baseUrl.replace(/\/$/, "")}/${bucket}/${path}`;
    return publicUrl;
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error(
      `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function deleteFileFromStorage(
  path: string,
  bucket: string = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "company-assets",
): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: path,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Delete error:", error);
    throw new Error(
      `Delete failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
