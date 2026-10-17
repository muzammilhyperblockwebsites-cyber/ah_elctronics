/// <reference types="node" />
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { siteConfig } from "../lib/siteConfig";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting A H Electronics Database Seed...");

  // 1. Seed Super Admin
  const adminEmail = (process.env.ADMIN_EMAIL || "ilyas2030@yahoo.com").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@AH2026!";
  const adminName = process.env.ADMIN_NAME || "A H Electronics Admin";

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      name: adminName,
      role: "Super Admin",
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: "Super Admin",
    },
  });

  console.log(`✅ Super Admin configured: ${admin.email} (ID: ${admin.id})`);

  // 2. Seed Categories
  console.log("📁 Seeding Categories...");
  for (let i = 0; i < siteConfig.categories.length; i++) {
    const cat = siteConfig.categories[i];
    const subcategories = "subcategories" in cat ? cat.subcategories : [];
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: "",
        image: cat.image || "",
        icon: cat.icon || "Package",
        subcategories: JSON.stringify(subcategories),
        order: i,
        seoTitle: `${cat.name} | A H Electronics`,
        seoDescription: `Browse quality ${cat.name} at A H Electronics.`,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: "",
        image: cat.image || "",
        icon: cat.icon || "Package",
        subcategories: JSON.stringify(subcategories),
        order: i,
        seoTitle: `${cat.name} | A H Electronics`,
        seoDescription: `Browse quality ${cat.name} at A H Electronics.`,
      },
    });
  }
  console.log(`✅ Seeded ${siteConfig.categories.length} categories.`);

  // 3. Seed Brands
  console.log("🏷️ Seeding Brands...");
  for (let i = 0; i < siteConfig.brands.length; i++) {
    const b = siteConfig.brands[i];
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {
        name: b.name,
        description: "",
        logo: b.logo || "",
        order: i,
      },
      create: {
        name: b.name,
        slug: b.slug,
        description: "",
        logo: b.logo || "",
        order: i,
      },
    });
  }
  console.log(`✅ Seeded ${siteConfig.brands.length} brands.`);

  // 4. Seed Hero Slides
  console.log("🖼️ Seeding Hero Slides...");
  await prisma.heroSlide.deleteMany(); // Reset slides
  for (let i = 0; i < siteConfig.heroSlides.length; i++) {
    const slide = siteConfig.heroSlides[i] as {
      heading: string;
      text?: string;
      cta?: string;
      ctaLink?: string;
      desktopImage: string;
      mobileImage?: string;
    };
    await prisma.heroSlide.create({
      data: {
        title: slide.heading,
        subtitle: "",
        description: slide.text || "",
        badge: "",
        ctaText: slide.cta || "Order on WhatsApp",
        ctaLink: slide.ctaLink || "/products",
        imageDesktop: slide.desktopImage,
        imageMobile: slide.mobileImage || slide.desktopImage,
        order: i,
        active: true,
      },
    });
  }
  console.log(`✅ Seeded ${siteConfig.heroSlides.length} hero slides.`);

  // 5. Seed Promo Banners
  console.log("🎨 Seeding Promo Banners...");
  await prisma.promoBanner.deleteMany(); // Reset banners
  for (let i = 0; i < siteConfig.promoBanners.length; i++) {
    const banner = siteConfig.promoBanners[i] as {
      heading: string;
      cta?: string;
      ctaLink?: string;
      desktopImage: string;
      mobileImage?: string;
    };
    await prisma.promoBanner.create({
      data: {
        title: banner.heading,
        subtitle: "",
        tag: "",
        ctaText: banner.cta || "Order via WhatsApp",
        ctaLink: banner.ctaLink || "/products",
        imageDesktop: banner.desktopImage,
        imageMobile: banner.mobileImage || banner.desktopImage,
        order: i,
        active: true,
      },
    });
  }
  console.log(`✅ Seeded ${siteConfig.promoBanners.length} promo banners.`);

  // 6. Seed Site Settings
  console.log("⚙️ Seeding Site Settings...");
  const settingsData: Record<string, string> = {
    businessName: siteConfig.name,
    tagline: siteConfig.tagline,
    description: siteConfig.description,
    phone: siteConfig.contact.phone,
    whatsapp: siteConfig.contact.whatsapp,
    phoneCall: siteConfig.contact.phoneCall,
    whatsappClean: siteConfig.contact.whatsappClean,
    whatsappIntl: siteConfig.contact.whatsappIntl,
    email: siteConfig.contact.email,
    address: siteConfig.contact.address,
    businessHours: JSON.stringify(siteConfig.businessHours),
    social: JSON.stringify(siteConfig.social),
    announcements: JSON.stringify(siteConfig.announcements),
  };

  for (const [key, value] of Object.entries(settingsData)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  console.log("✅ Seeded Site Settings.");

  // 7. Seed Products from data/products.json
  const productsFilePath = path.join(process.cwd(), "data", "products.json");
  if (fs.existsSync(productsFilePath)) {
    console.log("📦 Importing products from data/products.json...");
    const rawData = fs.readFileSync(productsFilePath, "utf-8");
    const products = JSON.parse(rawData);

    console.log(`Found ${products.length} products to import.`);

    let inserted = 0;
    let updated = 0;

    // Use transaction batches for fast and reliable insertion in MongoDB
    const batchSize = 100;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      await prisma.$transaction(
        batch.map((p: any) => {
          const galleryStr = JSON.stringify(p.gallery || []);
          const specsStr = JSON.stringify(p.specifications || {});
          const cleanPrice = typeof p.price === "number" && p.price > 0 ? p.price : null;

          return prisma.product.upsert({
            where: { slug: p.slug },
            update: {
              name: p.name,
              brand: p.brand,
              model: p.model || "",
              category: p.category,
              subcategory: p.subcategory || "",
              series: p.series || "",
              price: cleanPrice,
              priceSource: p.priceSource || (cleanPrice ? "json" : "none"),
              stockStatus: p.availability || "In Stock",
              mainImage: p.mainImage || "/assets/system/product-image-placeholder.webp",
              gallery: galleryStr,
              specifications: specsStr,
              shortDescription: p.shortDescription || "",
              warranty: p.warranty || "",
              availability: p.availability || "In Stock",
              featured: Boolean(p.featured),
              specialOffer: Boolean(p.specialOffer),
              sourceUrl: p.sourceUrl || "",
              seoTitle: `${p.name} | A H Electronics`,
              seoDescription: `${p.name} (${p.model}) from ${p.brand}. Authentic appliances at A H Electronics, Lahore.`,
            },
            create: {
              slug: p.slug,
              name: p.name,
              brand: p.brand,
              model: p.model || "",
              category: p.category,
              subcategory: p.subcategory || "",
              series: p.series || "",
              price: cleanPrice,
              priceSource: p.priceSource || (cleanPrice ? "json" : "none"),
              stockStatus: p.availability || "In Stock",
              mainImage: p.mainImage || "/assets/system/product-image-placeholder.webp",
              gallery: galleryStr,
              specifications: specsStr,
              shortDescription: p.shortDescription || "",
              warranty: p.warranty || "",
              availability: p.availability || "In Stock",
              featured: Boolean(p.featured),
              specialOffer: Boolean(p.specialOffer),
              sourceUrl: p.sourceUrl || "",
              seoTitle: `${p.name} | A H Electronics`,
              seoDescription: `${p.name} (${p.model}) from ${p.brand}. Authentic appliances at A H Electronics, Lahore.`,
            },
          });
        })
      );
      inserted += batch.length;
      process.stdout.write(`\rImported ${inserted}/${products.length} products...`);
    }
    console.log(`\n✅ Finished importing all ${inserted} products into MongoDB.`);
  } else {
    console.warn("⚠️ data/products.json not found, skipping product import.");
  }

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
