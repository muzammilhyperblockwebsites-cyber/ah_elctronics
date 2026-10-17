import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/db";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

// In-memory rate limiting map: ip -> timestamps
const ipRequests = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10;

  const timestamps = (ipRequests.get(ip) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    return true;
  }
  timestamps.push(now);
  ipRequests.set(ip, timestamps);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many inquiries submitted. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      customerName,
      phone,
      city = "",
      productName,
      productModel = "",
      productPrice = null,
      quantity = 1,
      productUrl = "",
      productSlug = "",
      productId = null,
      message = "",
      consent,
      sourcePage = "Website",
    } = body;

    // 1. Validation
    const cleanName = (customerName || "").trim();
    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json(
        { error: "Please enter a valid customer name (at least 2 characters)." },
        { status: 400 }
      );
    }

    const rawPhone = (phone || "").trim();
    const digitsOnly = rawPhone.replace(/\D/g, "");
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return NextResponse.json(
        { error: "Please enter a valid phone or WhatsApp number (at least 10 digits)." },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { error: "Please confirm your consent to be contacted regarding this enquiry." },
        { status: 400 }
      );
    }

    const cleanProduct = (productName || "General Inquiry").trim();
    const cleanCity = (city || "").trim();
    const cleanMessage = (message || "").trim();
    const cleanQty = Math.max(1, Math.min(100, Number(quantity) || 1));
    const userAgent = req.headers.get("user-agent") || "";

    // 2. Anti-Duplicate Check
    // If same phone submitted the same product within last 10 minutes,
    // reuse the existing lead and refNumber instead of creating duplicate records.
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const existingLead = await prisma.lead.findFirst({
      where: {
        phone: rawPhone,
        productName: cleanProduct,
        createdAt: { gte: tenMinutesAgo },
      },
      orderBy: { id: "desc" },
    });

    let refNumber = "";
    let leadId = "";

    if (existingLead) {
      refNumber = existingLead.refNumber;
      leadId = existingLead.id;

      // Update existing lead touch timestamp and message if provided
      await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          updatedAt: new Date(),
          quantity: cleanQty,
          message: cleanMessage || existingLead.message,
        },
      });
    } else {
      // 3. Create New Lead
      const created = await prisma.lead.create({
        data: {
          refNumber: "TEMP-" + Date.now(),
          customerName: cleanName,
          phone: rawPhone,
          city: cleanCity,
          productName: cleanProduct,
          productModel: (productModel || "").trim(),
          productPrice: productPrice ? Number(productPrice) : null,
          quantity: cleanQty,
          productUrl: (productUrl || "").trim(),
          productSlug: (productSlug || "").trim(),
          productId: productId ? String(productId) : null,
          message: cleanMessage,
          consent: Boolean(consent),
          sourcePage: (sourcePage || "").trim(),
          status: "WhatsApp Opened",
          notes: JSON.stringify([
            {
              id: "1",
              text: `Lead initiated from ${sourcePage || "store page"}.`,
              createdAt: new Date().toISOString(),
              author: "System",
            },
          ]),
          ipAddress: ip,
          userAgent: userAgent.slice(0, 255),
        },
      });

      leadId = created.id;
      refNumber = `AH-${created.id}`;

      await prisma.lead.update({
        where: { id: created.id },
        data: { refNumber },
      });
    }

    // 4. Build Prefilled WhatsApp Message using dynamic SiteSettings
    const settings = await getSiteSettings();
    const businessName = settings.name || "A H Electronics";
    const isGeneral = cleanProduct.toLowerCase().includes("general");
    let whatsappText = "";

    if (isGeneral) {
      whatsappText = [
        `Assalam-o-Alaikum ${businessName},`,
        "",
        `*GENERAL ENQUIRY / REFERENCE: #${refNumber}*`,
        "",
        "*Customer Details:*",
        `• Name: ${cleanName}`,
        `• Phone: ${rawPhone}`,
        cleanCity ? `• City: ${cleanCity}` : null,
        "",
        cleanMessage ? `*Message:*\n${cleanMessage}\n` : null,
        "Please assist me with this inquiry. Thank you!",
      ]
        .filter(Boolean)
        .join("\n");
    } else {
      const priceText = productPrice ? formatPrice(Number(productPrice)) : "Contact for Price";
      whatsappText = [
        `Assalam-o-Alaikum ${businessName},`,
        "",
        `*ORDER ENQUIRY / REFERENCE: #${refNumber}*`,
        "",
        "*Customer Details:*",
        `• Name: ${cleanName}`,
        `• Phone: ${rawPhone}`,
        cleanCity ? `• City: ${cleanCity}` : null,
        "",
        "*Product Details:*",
        `• Product: ${cleanProduct}`,
        productModel ? `• Model: ${productModel}` : null,
        `• Price: ${priceText}`,
        cleanQty > 1 ? `• Quantity: ${cleanQty}` : `• Quantity: 1`,
        productUrl ? `• Product URL: ${productUrl}` : null,
        "",
        cleanMessage ? `*Additional Note:*\n${cleanMessage}\n` : null,
        "Please confirm availability, delivery charges, and order booking. Thank you!",
      ]
        .filter(Boolean)
        .join("\n");
    }

    const whatsappClean = (settings.contact.whatsappClean || "923231469205").replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${whatsappClean}?text=${encodeURIComponent(whatsappText)}`;

    return NextResponse.json({
      success: true,
      refNumber,
      leadId,
      whatsappUrl,
    });
  } catch (err: any) {
    console.error("Lead submission error:", err);
    return NextResponse.json(
      { error: "An error occurred while saving your inquiry. Please try again." },
      { status: 500 }
    );
  }
}
