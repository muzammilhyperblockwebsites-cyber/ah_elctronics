import { siteConfig } from "./siteConfig";

// ============================================================
// WhatsApp URL & Message Builder
// ============================================================

/**
 * Build a WhatsApp deep-link URL with a pre-filled message.
 */
export function getWhatsAppUrl(message: string, whatsappClean?: string | number): string {
  const encoded = encodeURIComponent(String(message || "").trim());
  const rawNumber = String(whatsappClean || siteConfig.contact.whatsappClean || "");
  const number = rawNumber.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encoded}`;
}

/**
 * Build an order message for a single product.
 */
export function buildOrderMessage(opts: {
  productName: string;
  model: string;
  brand: string;
  price: string;
  quantity?: number;
  productUrl?: string;
  customerName?: string;
  city?: string;
  phone?: string;
  additionalMessage?: string;
  businessName?: string;
}): string {
  const lines: string[] = [
    `Hello ${opts.businessName || siteConfig.name},`,
    "",
    "I would like to order/enquire about this product:",
    "",
    `Product: ${opts.productName}`,
    `Model: ${opts.model}`,
    `Brand: ${opts.brand}`,
    `Price: ${opts.price}`,
  ];

  if (opts.quantity && opts.quantity > 1) {
    lines.push(`Quantity: ${opts.quantity}`);
  }

  if (opts.productUrl) {
    lines.push(`Product Link: ${opts.productUrl}`);
  }

  lines.push("");

  if (opts.customerName) lines.push(`Customer Name: ${opts.customerName}`);
  if (opts.city) lines.push(`City: ${opts.city}`);
  if (opts.phone) lines.push(`Phone: ${opts.phone}`);
  if (opts.additionalMessage) lines.push(`Message: ${opts.additionalMessage}`);

  lines.push("");
  lines.push(
    "Please confirm the latest price, availability, warranty, and delivery details."
  );

  return lines.join("\n");
}

/**
 * Build a simple inquiry message.
 */
export function buildInquiryMessage(opts: {
  productName: string;
  model: string;
  brand: string;
  productUrl?: string;
  businessName?: string;
}): string {
  return [
    `Hello ${opts.businessName || siteConfig.name},`,
    "",
    "I would like to ask about this product:",
    "",
    `Product: ${opts.productName}`,
    `Model: ${opts.model}`,
    `Brand: ${opts.brand}`,
    opts.productUrl ? `Product Link: ${opts.productUrl}` : "",
    "",
    "Please share the latest price, availability, warranty, and delivery details.",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Build a general contact/inquiry message.
 */
export function buildContactMessage(opts: {
  name?: string;
  phone?: string;
  city?: string;
  message: string;
  businessName?: string;
}): string {
  const lines: string[] = [
    `Hello ${opts.businessName || siteConfig.name},`,
    "",
  ];
  if (opts.name) lines.push(`Name: ${opts.name}`);
  if (opts.phone) lines.push(`Phone: ${opts.phone}`);
  if (opts.city) lines.push(`City: ${opts.city}`);
  lines.push("");
  lines.push(opts.message);

  return lines.join("\n");
}

/**
 * Build an order message for multiple products (order list).
 */
export function buildBulkOrderMessage(
  items: Array<{
    name: string;
    model: string;
    price: string;
    quantity: number;
  }>,
  customerInfo?: {
    name?: string;
    city?: string;
    phone?: string;
    message?: string;
    businessName?: string;
  }
): string {
  const lines: string[] = [
    `Hello ${customerInfo?.businessName || siteConfig.name},`,
    "",
    "I would like to order the following products:",
    "",
  ];

  items.forEach((item, i) => {
    lines.push(`${i + 1}. ${item.name}`);
    lines.push(`   Model: ${item.model}`);
    lines.push(`   Price: ${item.price}`);
    lines.push(`   Quantity: ${item.quantity}`);
    lines.push("");
  });

  if (customerInfo) {
    if (customerInfo.name) lines.push(`Customer Name: ${customerInfo.name}`);
    if (customerInfo.city) lines.push(`City: ${customerInfo.city}`);
    if (customerInfo.phone) lines.push(`Phone: ${customerInfo.phone}`);
    if (customerInfo.message) lines.push(`Message: ${customerInfo.message}`);
    lines.push("");
  }

  lines.push(
    "Please confirm the latest prices, availability, warranty, and delivery details for all items."
  );

  return lines.join("\n");
}
