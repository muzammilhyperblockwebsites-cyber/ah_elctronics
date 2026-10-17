import { NextRequest, NextResponse } from "next/server";
import { uploadImageBuffer, isStorageConfigured } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    if (!isStorageConfigured()) {
      return NextResponse.json(
        {
          error:
            "Cloud image storage is not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file, or paste an external image URL.",
        },
        { status: 501 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "ah-electronics/products";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadImageBuffer(buffer, folder);

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
