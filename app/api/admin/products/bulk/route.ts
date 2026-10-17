import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ids, value } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one product." },
        { status: 400 }
      );
    }

    const productIds = ids.map((id: unknown) => String(id)).filter(Boolean);

    if (action === "delete") {
      const result = await prisma.product.deleteMany({
        where: { id: { in: productIds } },
      });
      revalidatePath("/");
      revalidatePath("/products");
      return NextResponse.json({
        success: true,
        message: `Deleted ${result.count} products successfully.`,
      });
    }

    if (action === "toggle-featured") {
      const result = await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { featured: Boolean(value) },
      });
      revalidatePath("/");
      return NextResponse.json({
        success: true,
        message: `Updated featured status for ${result.count} products.`,
      });
    }

    if (action === "toggle-offer") {
      const result = await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { specialOffer: Boolean(value) },
      });
      revalidatePath("/");
      revalidatePath("/offers");
      return NextResponse.json({
        success: true,
        message: `Updated special offer status for ${result.count} products.`,
      });
    }

    return NextResponse.json({ error: "Invalid bulk action" }, { status: 400 });
  } catch (err: any) {
    console.error("Bulk action failed:", err);
    return NextResponse.json(
      { error: err.message || "Failed to perform bulk action" },
      { status: 500 }
    );
  }
}
