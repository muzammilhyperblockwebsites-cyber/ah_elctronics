import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalProducts,
      totalBrands,
      totalCategories,
      featuredProducts,
      specialOffers,
      missingPrices,
      missingImages,
      recentProducts,
      newLeads,
      todayLeads,
      confirmedOrders,
      pendingFollowUps,
      recentLeads,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.brand.count(),
      prisma.category.count(),
      prisma.product.count({ where: { featured: true } }),
      prisma.product.count({ where: { specialOffer: true } }),
      prisma.product.count({
        where: {
          OR: [{ price: null }, { price: 0 }],
        },
      }),
      prisma.product.count({
        where: {
          OR: [
            { mainImage: "" },
            { mainImage: { contains: "placeholder" } },
          ],
        },
      }),
      prisma.product.findMany({
        take: 6,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          slug: true,
          name: true,
          brand: true,
          model: true,
          category: true,
          price: true,
          mainImage: true,
          stockStatus: true,
          updatedAt: true,
        },
      }),
      prisma.lead.count({
        where: { status: { in: ["New Lead", "WhatsApp Opened"] } },
      }),
      prisma.lead.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      prisma.lead.count({
        where: { status: "Order Confirmed" },
      }),
      prisma.lead.count({
        where: { status: { in: ["WhatsApp Opened", "Contacted", "No Response"] } },
      }),
      prisma.lead.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalProducts,
        totalBrands,
        totalCategories,
        featuredProducts,
        specialOffers,
        missingPrices,
        missingImages,
        newLeads,
        todayLeads,
        confirmedOrders,
        pendingFollowUps,
      },
      recentProducts,
      recentLeads,
    });
  } catch (err: any) {
    console.error("Failed to fetch admin stats:", err);
    return NextResponse.json(
      { error: "Failed to load dashboard statistics" },
      { status: 500 }
    );
  }
}
