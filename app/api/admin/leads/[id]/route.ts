import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: "Invalid lead ID." }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch lead." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: "Invalid lead ID." }, { status: 400 });
    }

    const session = await getAdminSession();
    const adminName = session?.name || "Admin";

    const body = await req.json();
    const { status, noteText } = body;

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const updateData: any = {};

    if (status) {
      updateData.status = status;
    }

    if (noteText && typeof noteText === "string" && noteText.trim()) {
      let existingNotes: any[] = [];
      try {
        existingNotes = JSON.parse(lead.notes || "[]");
      } catch {
        existingNotes = [];
      }

      existingNotes.push({
        id: String(Date.now()),
        text: noteText.trim(),
        createdAt: new Date().toISOString(),
        author: adminName,
      });

      updateData.notes = JSON.stringify(existingNotes);
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      lead: updated,
      message: "Lead updated successfully.",
    });
  } catch (err: any) {
    console.error("Failed to update lead:", err);
    return NextResponse.json(
      { error: "Failed to update lead." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: "Invalid lead ID." }, { status: 400 });
    }

    await prisma.lead.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully.",
    });
  } catch (err: any) {
    console.error("Failed to delete lead:", err);
    return NextResponse.json(
      { error: "Failed to delete lead." },
      { status: 500 }
    );
  }
}
