import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    if (q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { model: { contains: q } },
          { brand: { contains: q } },
          { category: { contains: q } },
        ],
      },
      take: 8,
      orderBy: { id: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        model: true,
        brand: true,
        category: true,
        price: true,
        mainImage: true,
      },
    });

    return NextResponse.json({ results: products });
  } catch (err: any) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Search is temporarily unavailable." }, { status: 503 });
  }
}
