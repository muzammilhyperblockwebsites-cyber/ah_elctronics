import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany();
    const result: Record<string, any> = {};

    settings.forEach((s) => {
      const trimmed = (s.value || "").trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
          result[s.key] = JSON.parse(trimmed);
        } catch {
          result[s.key] = s.value;
        }
      } else {
        result[s.key] = s.value;
      }
    });

    return NextResponse.json({ settings: result });
  } catch (err: any) {
    console.error("Fetch settings error:", err);
    return NextResponse.json(
      { error: "Failed to fetch site settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    for (const [key, val] of Object.entries(body)) {
      const stringValue = typeof val === "object" ? JSON.stringify(val) : String(val);

      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: stringValue },
        create: { key, value: stringValue },
      });
    }

    // Invalidate public caches so header, footer, contact info update immediately
    revalidatePath("/");
    revalidatePath("/contact");
    revalidatePath("/about");
    revalidatePath("/products");

    return NextResponse.json({
      success: true,
      message: "Site settings updated successfully",
    });
  } catch (err: any) {
    console.error("Save settings error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
