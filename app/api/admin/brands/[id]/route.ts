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

    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

    const body = await req.json();
    const { name, slug, description, logo, order } = body;

    // If brand name changed, update products that had the old brand name
    if (name && name.trim() !== existing.name) {
      await prisma.product.updateMany({
        where: { brand: existing.name },
        data: { brand: name.trim() },
      });
    }

    const nextSlug =
      slug && slug.trim()
        ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
        : existing.slug;

    const updated = await prisma.brand.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        slug: nextSlug,
        description: description !== undefined ? description.trim() : existing.description,
        logo: logo !== undefined ? logo.trim() : existing.logo,
        order: typeof order === "number" ? order : existing.order,
      },
    });

    revalidatePath("/");
    revalidatePath(`/brand/${updated.slug}`);

    return NextResponse.json({ success: true, brand: updated });
  } catch (err: any) {
    console.error("Update brand error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update brand" },
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

    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

    const productCount = await prisma.product.count({
      where: { brand: existing.name },
    });

    if (productCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete brand "${existing.name}" because it still has ${productCount} assigned products. Reassign or delete products first.`,
        },
        { status: 400 }
      );
    }

    await prisma.brand.delete({ where: { id } });

    revalidatePath("/");

    return NextResponse.json({ success: true, message: "Brand deleted" });
  } catch (err: any) {
    console.error("Delete brand error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete brand" },
      { status: 500 }
    );
  }
}
