import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/products";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
    });

    // Compute product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await prisma.product.count({
          where: { category: cat.name },
        });
        let subcategories: string[] = [];
        try {
          subcategories = JSON.parse(cat.subcategories || "[]");
        } catch {}
        return {
          ...cat,
          subcategories,
          productCount,
        };
      })
    );

    return NextResponse.json({ categories: categoriesWithCount });
  } catch (err: any) {
    console.error("Categories fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, description, image, icon, subcategories, seoTitle, seoDescription } = body;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const cleanSlug = slug?.trim() || generateSlug(name);

    // Check unique
    const existing = await prisma.category.findFirst({
      where: { OR: [{ name: name.trim() }, { slug: cleanSlug }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A category with this name or slug already exists" },
        { status: 400 }
      );
    }

    const subcategoriesStr = Array.isArray(subcategories)
      ? JSON.stringify(subcategories)
      : typeof subcategories === "string"
      ? JSON.stringify(subcategories.split(",").map((s) => s.trim()).filter(Boolean))
      : "[]";

    const maxOrder = await prisma.category.aggregate({ _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? 0) + 1;

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        description: description?.trim() || "",
        image: image?.trim() || "",
        icon: icon?.trim() || "Package",
        subcategories: subcategoriesStr,
        order: nextOrder,
        seoTitle: seoTitle?.trim() || `${name} | A H Electronics`,
        seoDescription: seoDescription?.trim() || `Explore quality ${name} at A H Electronics.`,
      },
    });

    revalidatePath("/");
    revalidatePath("/categories");
    revalidatePath(`/category/${category.slug}`);

    return NextResponse.json({ success: true, category });
  } catch (err: any) {
    console.error("Create category error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create category" },
      { status: 500 }
    );
  }
}
