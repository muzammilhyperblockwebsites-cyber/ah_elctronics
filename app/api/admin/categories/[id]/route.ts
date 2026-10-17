import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    const body = await req.json();
    const { name, slug, description, image, icon, subcategories, order, seoTitle, seoDescription } = body;

    const subcategoriesStr = Array.isArray(subcategories)
      ? JSON.stringify(subcategories)
      : typeof subcategories === "string"
      ? JSON.stringify(subcategories.split(",").map((s) => s.trim()).filter(Boolean))
      : existing.subcategories;

    // If name changed, update products that had the old category name
    if (name && name.trim() !== existing.name) {
      await prisma.product.updateMany({
        where: { category: existing.name },
        data: { category: name.trim() },
      });
    }

    const nextSlug =
      slug && slug.trim()
        ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
        : existing.slug;

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        slug: nextSlug,
        description: description !== undefined ? description.trim() : existing.description,
        image: image !== undefined ? image.trim() : existing.image,
        icon: icon !== undefined ? icon.trim() : existing.icon,
        subcategories: subcategoriesStr,
        order: typeof order === "number" ? order : existing.order,
        seoTitle: seoTitle !== undefined ? seoTitle.trim() : existing.seoTitle,
        seoDescription: seoDescription !== undefined ? seoDescription.trim() : existing.seoDescription,
      },
    });

    revalidatePath("/");
    revalidatePath("/categories");
    revalidatePath(`/category/${updated.slug}`);

    return NextResponse.json({ success: true, category: updated });
  } catch (err: any) {
    console.error("Update category error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    // Check if category has products
    const productCount = await prisma.product.count({
      where: { category: existing.name },
    });

    if (productCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category "${existing.name}" because it still has ${productCount} assigned products. Reassign or delete products first.`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/categories");

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (err: any) {
    console.error("Delete category error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
