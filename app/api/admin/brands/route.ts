import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/products";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { order: "asc" },
    });

    const brandsWithCount = await Promise.all(
      brands.map(async (b) => {
        const productCount = await prisma.product.count({
          where: { brand: b.name },
        });
        return {
          ...b,
          productCount,
        };
      })
    );

    return NextResponse.json({ brands: brandsWithCount });
  } catch (err: any) {
    console.error("Brands fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, description, logo } = body;

    if (!name) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    const cleanSlug = slug?.trim() || generateSlug(name);

    const existing = await prisma.brand.findFirst({
      where: { OR: [{ name: name.trim() }, { slug: cleanSlug }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A brand with this name or slug already exists" },
        { status: 400 }
      );
    }

    const maxOrder = await prisma.brand.aggregate({ _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? 0) + 1;

    const brand = await prisma.brand.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        description: description?.trim() || "",
        logo: logo?.trim() || "",
        order: nextOrder,
      },
    });

    revalidatePath("/");
    revalidatePath(`/brand/${brand.slug}`);

    return NextResponse.json({ success: true, brand });
  } catch (err: any) {
    console.error("Create brand error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create brand" },
      { status: 500 }
    );
  }
}
