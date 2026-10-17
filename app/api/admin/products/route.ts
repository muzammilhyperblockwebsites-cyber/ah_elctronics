import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/products";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const brand = searchParams.get("brand")?.trim() || "";
    const stockStatus = searchParams.get("stockStatus")?.trim() || "";
    const priceStatus = searchParams.get("priceStatus")?.trim() || "";
    const featured = searchParams.get("featured");
    const specialOffer = searchParams.get("specialOffer");
    const sort = searchParams.get("sort") || "newest";

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { model: { contains: search } },
        { brand: { contains: search } },
      ];
    }

    if (category) where.category = category;
    if (brand) where.brand = brand;
    if (stockStatus) where.stockStatus = stockStatus;

    if (priceStatus === "has-price") {
      where.price = { gt: 0 };
    } else if (priceStatus === "contact-price") {
      where.OR = [{ price: null }, { price: 0 }];
    }

    if (featured === "true") where.featured = true;
    else if (featured === "false") where.featured = false;

    if (specialOffer === "true") where.specialOffer = true;
    else if (specialOffer === "false") where.specialOffer = false;

    // Determine sorting
    let orderBy: any = { updatedAt: "desc" };
    if (sort === "oldest") orderBy = { id: "asc" };
    else if (sort === "price-asc") orderBy = { price: "asc" };
    else if (sort === "price-desc") orderBy = { price: "desc" };
    else if (sort === "name-asc") orderBy = { name: "asc" };
    else if (sort === "name-desc") orderBy = { name: "desc" };

    const skip = (page - 1) * limit;

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
    ]);

    // Parse JSON strings for client convenience
    const parsedProducts = products.map((p) => {
      let gallery: string[] = [];
      let specs: Record<string, string> = {};
      try {
        gallery = JSON.parse(p.gallery || "[]");
      } catch {}
      try {
        specs = JSON.parse(p.specifications || "{}");
      } catch {}
      return {
        ...p,
        gallery,
        specifications: specs,
      };
    });

    return NextResponse.json({
      products: parsedProducts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    });
  } catch (err: any) {
    console.error("Failed to fetch products:", err);
    return NextResponse.json(
      { error: "Failed to fetch products list" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
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

    if (!name || !model || !brand || !category) {
      return NextResponse.json(
        { error: "Name, Model, Brand, and Category are required" },
        { status: 400 }
      );
    }

    // Generate base slug
    let baseSlug = generateSlug(`${brand}-${model}-${name}`.slice(0, 80));
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug uniqueness
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const cleanPrice =
      typeof price === "number" && price > 0 ? price : null;

    const galleryStr = Array.isArray(gallery)
      ? JSON.stringify(gallery)
      : JSON.stringify([]);
    const specsStr =
      specifications && typeof specifications === "object"
        ? JSON.stringify(specifications)
        : JSON.stringify({});

    const product = await prisma.product.create({
      data: {
        slug,
        name: name.trim(),
        model: model.trim(),
        brand: brand.trim(),
        category: category.trim(),
        subcategory: subcategory ? subcategory.trim() : "",
        series: series ? series.trim() : "",
        price: cleanPrice,
        priceSource: cleanPrice ? "admin" : "none",
        stockStatus: stockStatus || "In Stock",
        mainImage: mainImage?.trim() || "/assets/system/product-image-placeholder.webp",
        gallery: galleryStr,
        specifications: specsStr,
        shortDescription: shortDescription?.trim() || "",
        warranty: warranty?.trim() || "",
        availability: availability?.trim() || stockStatus || "In Stock",
        featured: Boolean(featured),
        specialOffer: Boolean(specialOffer),
        seoTitle: seoTitle?.trim() || `${name} | A H Electronics`,
        seoDescription:
          seoDescription?.trim() ||
          `${name} (${model}) by ${brand}. Authentic electronics and appliances available at A H Electronics, Lahore.`,
      },
    });

    // Invalidate public caches
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/categories");

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (err: any) {
    console.error("Failed to create product:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
