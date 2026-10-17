import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const product = searchParams.get("product")?.trim() || "";
    const dateRange = searchParams.get("dateRange")?.trim() || "";

    const where: any = {};

    if (search) {
      where.OR = [
        { refNumber: { contains: search } },
        { customerName: { contains: search } },
        { phone: { contains: search } },
        { city: { contains: search } },
        { productName: { contains: search } },
        { productModel: { contains: search } },
      ];
    }

    if (status && status !== "All") {
      where.status = status;
    }

    if (product && product !== "All") {
      where.productName = { contains: product };
    }

    if (dateRange) {
      const now = new Date();
      if (dateRange === "today") {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        where.createdAt = { gte: startOfToday };
      } else if (dateRange === "7days") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        where.createdAt = { gte: sevenDaysAgo };
      } else if (dateRange === "30days") {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        where.createdAt = { gte: thirtyDaysAgo };
      }
    }

    const [total, leads, statusGroup] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const group of statusGroup) {
      statusCounts[group.status] = group._count._all;
    }

    return NextResponse.json({
      leads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      statusCounts,
    });
  } catch (err: any) {
    console.error("Admin leads list error:", err);
    return NextResponse.json(
      { error: "Failed to load WhatsApp leads." },
      { status: 500 }
    );
  }
}
