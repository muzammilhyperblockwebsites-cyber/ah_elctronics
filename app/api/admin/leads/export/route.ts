import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status")?.trim() || "";

    const where: any = {};
    if (status && status !== "All") {
      where.status = status;
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Reference",
      "Date Time",
      "Customer Name",
      "Phone",
      "City",
      "Product Name",
      "Model",
      "Price",
      "Quantity",
      "Status",
      "Source Page",
      "Customer Message",
      "Internal Notes",
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const val = String(str).replace(/"/g, '""');
      return `"${val}"`;
    };

    const rows = leads.map((l) => {
      let notesSummary = "";
      try {
        const notesArr = JSON.parse(l.notes || "[]");
        notesSummary = notesArr.map((n: any) => `[${n.author}: ${n.text}]`).join("; ");
      } catch {
        notesSummary = l.notes || "";
      }

      return [
        escapeCsv(l.refNumber),
        escapeCsv(new Date(l.createdAt).toLocaleString("en-PK", { timeZone: "Asia/Karachi" })),
        escapeCsv(l.customerName),
        escapeCsv(l.phone),
        escapeCsv(l.city),
        escapeCsv(l.productName),
        escapeCsv(l.productModel),
        l.productPrice !== null ? l.productPrice : "N/A",
        l.quantity,
        escapeCsv(l.status),
        escapeCsv(l.sourcePage),
        escapeCsv(l.message),
        escapeCsv(notesSummary),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `ah-electronics-leads-${dateStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error("Leads export error:", err);
    return NextResponse.json(
      { error: "Failed to export leads." },
      { status: 500 }
    );
  }
}
