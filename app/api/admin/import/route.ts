import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/products";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let productsToImport: any[] = [];

    if (contentType.includes("application/json")) {
      const body = await req.json();
      productsToImport = Array.isArray(body) ? body : body.products || [];
    } else {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      const text = await file.text();

      if (file.name.endsWith(".json")) {
        productsToImport = JSON.parse(text);
      } else {
        // Simple CSV parser
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          return NextResponse.json({ error: "CSV file is empty or missing data rows" }, { status: 400 });
        }

        // Header parsing
        const headers = lines[0].split(",").map((h) => h.replace(/(^"|"$)/g, "").trim().toLowerCase());

        for (let i = 1; i < lines.length; i++) {
          const rowRegex = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^",]*))/g;
          const values: string[] = [];
          let match;
          while ((match = rowRegex.exec(lines[i])) !== null) {
            values.push((match[1] ? match[1].replace(/""/g, '"') : match[2] || "").trim());
          }

          const obj: any = {};
          headers.forEach((h, idx) => {
            obj[h] = values[idx] || "";
          });

          if (obj.name || obj.model) {
            productsToImport.push({
              name: obj.name,
              brand: obj.brand || "Generic",
              model: obj.model || "N/A",
              category: obj.category || "General Appliances",
              subcategory: obj.subcategory || "",
              price: obj.price && !isNaN(parseFloat(obj.price)) ? parseFloat(obj.price) : null,
              stockStatus: obj.stockstatus || "In Stock",
              mainImage: obj.mainimage || "/assets/system/product-image-placeholder.webp",
              featured: obj.featured === "true",
              specialOffer: obj.specialoffer === "true",
              warranty: obj.warranty || "",
              shortDescription: obj.shortdescription || "",
            });
          }
        }
      }
    }

    if (!Array.isArray(productsToImport) || productsToImport.length === 0) {
      return NextResponse.json({ error: "No valid products found in payload" }, { status: 400 });
    }

    let inserted = 0;
    let updated = 0;

    for (const p of productsToImport) {
      if (!p.name || !p.model) continue;

      let slug = p.slug;
      if (!slug) {
        slug = generateSlug(`${p.brand || ""}-${p.model}-${p.name}`.slice(0, 80));
      }

      const cleanPrice =
        typeof p.price === "number" && p.price > 0
          ? p.price
          : typeof p.price === "string" && !isNaN(parseFloat(p.price))
          ? parseFloat(p.price)
          : null;

      const galleryStr = Array.isArray(p.gallery) ? JSON.stringify(p.gallery) : "[]";
      const specsStr =
        p.specifications && typeof p.specifications === "object"
          ? JSON.stringify(p.specifications)
          : "{}";

      const existing = await prisma.product.findFirst({
        where: {
          OR: [{ slug }, { model: p.model, brand: p.brand }],
        },
      });

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            name: p.name.trim(),
            brand: (p.brand || existing.brand).trim(),
            category: (p.category || existing.category).trim(),
            subcategory: p.subcategory || existing.subcategory,
            price: cleanPrice,
            priceSource: cleanPrice ? "import" : "none",
            stockStatus: p.stockStatus || existing.stockStatus,
            mainImage: p.mainImage || existing.mainImage,
            featured: p.featured !== undefined ? Boolean(p.featured) : existing.featured,
            specialOffer: p.specialOffer !== undefined ? Boolean(p.specialOffer) : existing.specialOffer,
          },
        });
        updated++;
      } else {
        await prisma.product.create({
          data: {
            slug,
            name: p.name.trim(),
            brand: (p.brand || "General").trim(),
            model: p.model.trim(),
            category: (p.category || "Appliances").trim(),
            subcategory: p.subcategory || "",
            series: p.series || "",
            price: cleanPrice,
            priceSource: cleanPrice ? "import" : "none",
            stockStatus: p.stockStatus || "In Stock",
            mainImage: p.mainImage || "/assets/system/product-image-placeholder.webp",
            gallery: galleryStr,
            specifications: specsStr,
            shortDescription: p.shortDescription || "",
            warranty: p.warranty || "",
            availability: p.stockStatus || "In Stock",
            featured: Boolean(p.featured),
            specialOffer: Boolean(p.specialOffer),
            seoTitle: `${p.name} | A H Electronics`,
            seoDescription: `${p.name} (${p.model}) from ${p.brand}. Authentic appliances at A H Electronics.`,
          },
        });
        inserted++;
      }
    }

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/categories");

    return NextResponse.json({
      success: true,
      message: `Bulk import completed: ${inserted} added, ${updated} updated.`,
      stats: { total: productsToImport.length, inserted, updated },
    });
  } catch (err: any) {
    console.error("Import failed:", err);
    return NextResponse.json(
      { error: err.message || "Failed to import products" },
      { status: 500 }
    );
  }
}
