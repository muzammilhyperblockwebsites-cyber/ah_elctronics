import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let gallery: string[] = [];
    let specifications: Record<string, string> = {};
    try {
      gallery = JSON.parse(product.gallery || "[]");
    } catch {}
    try {
      specifications = JSON.parse(product.specifications || "{}");
    } catch {}

    return NextResponse.json({
      product: {
        ...product,
        gallery,
        specifications,
      },
    });
  } catch (err: any) {
    console.error("Failed to fetch product:", err);
    return NextResponse.json(
      { error: "Failed to fetch product details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      model,
      brand,
      category,
      subcategory,
      series,
      price,
      stockStatus,
      mainImage,
      gallery,
      specifications,
      shortDescription,
      warranty,
      availability,
      featured,
      specialOffer,
      seoTitle,
      seoDescription,
    } = body;

    const cleanPrice =
      typeof price === "number" && price > 0
        ? price
        : price === null || price === ""
        ? null
        : existing.price;

    const galleryStr = Array.isArray(gallery)
      ? JSON.stringify(gallery)
      : existing.gallery;

    const specsStr =
      specifications && typeof specifications === "object"
        ? JSON.stringify(specifications)
        : existing.specifications;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? String(name).trim() : existing.name,
        model: model !== undefined ? String(model).trim() : existing.model,
        brand: brand !== undefined ? String(brand).trim() : existing.brand,
        category: category !== undefined ? String(category).trim() : existing.category,
        subcategory: subcategory !== undefined ? String(subcategory).trim() : existing.subcategory,
        series: series !== undefined ? String(series).trim() : existing.series,
        price: cleanPrice,
        priceSource: cleanPrice ? "admin" : "none",
        stockStatus: stockStatus !== undefined ? String(stockStatus) : existing.stockStatus,
        mainImage: mainImage !== undefined ? String(mainImage).trim() : existing.mainImage,
        gallery: galleryStr,
        specifications: specsStr,
        shortDescription: shortDescription !== undefined ? String(shortDescription).trim() : existing.shortDescription,
        warranty: warranty !== undefined ? String(warranty).trim() : existing.warranty,
        availability: availability !== undefined ? String(availability).trim() : existing.availability,
        featured: featured !== undefined ? Boolean(featured) : existing.featured,
        specialOffer: specialOffer !== undefined ? Boolean(specialOffer) : existing.specialOffer,
        seoTitle: seoTitle !== undefined ? String(seoTitle).trim() : existing.seoTitle,
        seoDescription: seoDescription !== undefined ? String(seoDescription).trim() : existing.seoDescription,
      },
    });

    // Invalidate public caches immediately
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${updated.slug}`);
    revalidatePath(`/category/${updated.category.toLowerCase().replace(/\s+/g, "-")}`);
    revalidatePath(`/brand/${updated.brand.toLowerCase().replace(/\s+/g, "-")}`);

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: updated,
    });
  } catch (err: any) {
    console.error("Failed to update product:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update product" },
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
    if (!id) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });

    // Invalidate public caches
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/categories");

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err: any) {
    console.error("Failed to delete product:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
