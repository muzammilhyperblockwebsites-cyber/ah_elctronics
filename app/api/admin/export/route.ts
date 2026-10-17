import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";

    const products = await prisma.product.findMany({
      orderBy: { id: "asc" },
    });

    if (format === "csv") {
      const headers = [
        "ID",
        "Slug",
        "Name",
        "Brand",
        "Model",
        "Category",
        "Subcategory",
        "Price",
        "StockStatus",
        "MainImage",
        "Featured",
        "SpecialOffer",
        "Warranty",
        "ShortDescription",
      ];

      const escapeCsv = (str: any) => {
        if (str === null || str === undefined) return '""';
        const val = String(str).replace(/"/g, '""');
        return `"${val}"`;
      };

      const rows = products.map((p) => [
        p.id,
        escapeCsv(p.slug),
        escapeCsv(p.name),
        escapeCsv(p.brand),
        escapeCsv(p.model),
        escapeCsv(p.category),
        escapeCsv(p.subcategory),
        p.price !== null ? p.price : "",
        escapeCsv(p.stockStatus),
        escapeCsv(p.mainImage),
        p.featured ? "true" : "false",
        p.specialOffer ? "true" : "false",
        escapeCsv(p.warranty),
        escapeCsv(p.shortDescription),
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="ah-electronics-products-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    // Default: JSON export
    const jsonOutput = products.map((p) => {
      let gallery = [];
      let specs = {};
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

    return new NextResponse(JSON.stringify(jsonOutput, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="ah-electronics-products-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (err: any) {
    console.error("Export failed:", err);
    return NextResponse.json(
      { error: "Failed to export products" },
      { status: 500 }
    );
  }
}
