import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [slides, banners] = await Promise.all([
      prisma.heroSlide.findMany({ orderBy: { order: "asc" } }),
      prisma.promoBanner.findMany({ orderBy: { order: "asc" } }),
    ]);

    return NextResponse.json({ slides, banners });
  } catch (err: any) {
    console.error("Fetch banners error:", err);
    return NextResponse.json(
      { error: "Failed to fetch slides and banners" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body; // type: 'slide' | 'banner'

    if (type === "slide") {
      if (data.id) {
        const updated = await prisma.heroSlide.update({
          where: { id: data.id },
          data: {
            title: data.title,
            subtitle: data.subtitle || "",
            description: data.description || "",
            badge: data.badge || "",
            ctaText: data.ctaText || "Order on WhatsApp",
            ctaLink: data.ctaLink || "/products",
            imageDesktop: data.imageDesktop,
            imageMobile: data.imageMobile || data.imageDesktop,
            active: data.active !== undefined ? Boolean(data.active) : true,
            order: typeof data.order === "number" ? data.order : 0,
          },
        });
        revalidatePath("/");
        return NextResponse.json({ success: true, item: updated });
      } else {
        const created = await prisma.heroSlide.create({
          data: {
            title: data.title,
            subtitle: data.subtitle || "",
            description: data.description || "",
            badge: data.badge || "",
            ctaText: data.ctaText || "Order on WhatsApp",
            ctaLink: data.ctaLink || "/products",
            imageDesktop: data.imageDesktop,
            imageMobile: data.imageMobile || data.imageDesktop,
            active: data.active !== undefined ? Boolean(data.active) : true,
            order: typeof data.order === "number" ? data.order : 0,
          },
        });
        revalidatePath("/");
        return NextResponse.json({ success: true, item: created });
      }
    } else if (type === "banner") {
      if (data.id) {
        const updated = await prisma.promoBanner.update({
          where: { id: data.id },
          data: {
            title: data.title,
            subtitle: data.subtitle || "",
            tag: data.tag || "",
            ctaText: data.ctaText || "Order via WhatsApp",
            ctaLink: data.ctaLink || "/products",
            imageDesktop: data.imageDesktop,
            imageMobile: data.imageMobile || data.imageDesktop,
            active: data.active !== undefined ? Boolean(data.active) : true,
            order: typeof data.order === "number" ? data.order : 0,
          },
        });
        revalidatePath("/");
        return NextResponse.json({ success: true, item: updated });
      } else {
        const created = await prisma.promoBanner.create({
          data: {
            title: data.title,
            subtitle: data.subtitle || "",
            tag: data.tag || "",
            ctaText: data.ctaText || "Order via WhatsApp",
            ctaLink: data.ctaLink || "/products",
            imageDesktop: data.imageDesktop,
            imageMobile: data.imageMobile || data.imageDesktop,
            active: data.active !== undefined ? Boolean(data.active) : true,
            order: typeof data.order === "number" ? data.order : 0,
          },
        });
        revalidatePath("/");
        return NextResponse.json({ success: true, item: created });
      }
    }

    return NextResponse.json({ error: "Invalid banner type" }, { status: 400 });
  } catch (err: any) {
    console.error("Save banner error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save banner" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'slide' | 'banner'
    const id = searchParams.get("id") || "";

    if (!id || !type) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    if (type === "slide") {
      await prisma.heroSlide.delete({ where: { id } });
    } else if (type === "banner") {
      await prisma.promoBanner.delete({ where: { id } });
    }

    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete banner error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete item" },
      { status: 500 }
    );
  }
}
