import { NextRequest, NextResponse } from "next/server";

const ALLOWED_IMAGE_HOSTS = new Set([
  "image.haier.com",
  "www.haier.com",
  "www.dawlance.com.pk",
  "www.orient.com.pk",
  "cdn.shopify.com",
  "www.atlashonda.com.pk",
  "canonappliances.com.pk",
  "canonpk.com",
  "res.cloudinary.com",
]);

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("url");
  if (!source) {
    return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
  }

  let imageUrl: URL;
  try {
    imageUrl = new URL(source);
  } catch {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }

  if (imageUrl.protocol !== "https:" || !ALLOWED_IMAGE_HOSTS.has(imageUrl.hostname)) {
    return NextResponse.json({ error: "Image host is not allowed" }, { status: 403 });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 (compatible; AHElectronicsImageProxy/1.0)",
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      console.warn(`Image proxy upstream returned ${response.status}: ${imageUrl.hostname}`);
      return NextResponse.json({ error: "Upstream image is unavailable" }, { status: 502 });
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Upstream response is not an image" }, { status: 502 });
    }

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
  }
}
