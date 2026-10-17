import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary if credentials are present
const isCloudinaryConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export interface UploadResult {
  url: string;
  publicId?: string;
}

/**
 * Upload an image file buffer to production cloud storage (Cloudinary)
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  folder: string = "ah-electronics"
): Promise<UploadResult> {
  if (!isCloudinaryConfigured) {
    throw new Error(
      "Cloudinary is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file, or enter direct image URLs."
    );
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Failed to upload image to Cloudinary"));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}

export function isStorageConfigured(): boolean {
  return isCloudinaryConfigured;
}
