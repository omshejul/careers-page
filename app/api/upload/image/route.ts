import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadFileToStorage } from "@/lib/uploadToSupabase";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const folder = formData.get("folder") as string | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Only images are allowed." },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File size exceeds 10MB limit" },
                { status: 400 }
            );
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = file.name.split(".").pop() || "jpg";
        const filename = `${timestamp}-${randomString}.${extension}`;
        const path = folder ? `${folder}/${filename}` : `images/${filename}`;

        // Upload to S3
        const publicUrl = await uploadFileToStorage(file, path);

        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : "Failed to upload image",
            },
            { status: 500 }
        );
    }
}

