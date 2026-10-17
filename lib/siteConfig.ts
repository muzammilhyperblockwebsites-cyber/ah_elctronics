// ============================================================
// A H Electronics — Central Site Configuration
// ============================================================
// ALL business details, contact information, social links,
// SEO defaults, and content configuration live here.
// ============================================================

export const siteConfig = {
  // ── Business Identity ──────────────────────────────────────
  name: "A H Electronics",
  tagline: "Quality Electronics at Competitive Prices",
  shortDescription:
    "Your trusted destination for home appliances, electronics, kitchen appliances, and motorcycles from leading brands in Pakistan.",
  description:
    "A H Electronics offers a wide range of home appliances, LED TVs, air conditioners, refrigerators, washing machines, kitchen appliances, and motorcycles from brands like Haier, Dawlance, Orient, Canon, and Atlas Honda. Browse our catalog and order directly through WhatsApp.",

  // ── Logos & Branding ───────────────────────────────────────
  logos: {
    header: "/assets/branding/ah-header-white-red-transparent.png",
    footer: "/assets/branding/ah-footer-transparent.svg",
    mark: "/favicon.svg",
    favicon: "/favicon.svg",
  },

  // ── Contact Information ────────────────────────────────────
  contact: {
    phone: "0306-4006066",
    mobile: "0333-4698197",
    whatsapp: "0323-1469205",
    phoneCall: "+923064006066",
    mobileCall: "+923334698197",
    whatsappClean: "923231469205",
    whatsappIntl: "+92 323 1469205",
    email: "ilyas2030@yahoo.com",
    address: "345-Lahore Road, Chowk Saddar Bazar, Lahore.",
  },

  // ── Business Hours ─────────────────────────────────────────
  businessHours: {
    weekdays: "Monday – Saturday: 10:00 AM – 9:00 PM",
    weekends: "Sunday: 12:00 PM – 6:00 PM",
    note: "Hours may vary on public holidays",
  },

  // ── Social Media Links ─────────────────────────────────────
  social: {
    facebook: "",
    instagram: "",
    youtube: "",
    twitter: "",
    tiktok: "",
  },

  // ── SEO Defaults ───────────────────────────────────────────
  seo: {
    titleTemplate: "%s | A H Electronics",
    defaultTitle: "A H Electronics — Quality Home Appliances & Electronics",
    defaultDescription:
      "Browse and order home appliances, LED TVs, air conditioners, refrigerators, washing machines, and motorcycles from leading brands. Order directly through WhatsApp with A H Electronics.",
    siteUrl: "https://ahelectronics.pk",
    ogImage: "/assets/branding/ah-electronics-header.png",
    locale: "en_PK",
    twitterHandle: "",
  },

  // ── Announcement Bar Messages ──────────────────────────────
  announcements: [
    "A H Electronics — Quality Electronics at Competitive Prices",
    "Order Directly Through WhatsApp: 0323-1469205",
    "Product Availability Confirmed on WhatsApp",
    "Leading Brands — Haier, Dawlance, Orient & More",
  ],

  // ── Hero Slides ────────────────────────────────────
  heroSlides: [
    {
      id: 1,
      heading: "Upgrade Your Home with Smart Electronics",
      text: "Explore reliable appliances from leading brands at competitive prices at A H Electronics.",
      cta: "Browse Products",
      ctaLink: "/products",
      desktopImage: "/assets/hero/hero-home-appliances-desktop.webp",
      mobileImage: "/assets/hero/hero-home-appliances-mobile.webp",
    },
    {
      id: 2,
      heading: "Cooling Solutions for Every Home",
      text: "Discover refrigerators and air conditioners for everyday comfort.",
      cta: "Explore Cooling",
      ctaLink: "/category/refrigerators",
      desktopImage: "/assets/hero/hero-cooling-desktop.webp",
      mobileImage: "/assets/hero/hero-cooling-mobile.webp",
    },
    {
      id: 3,
      heading: "Easy Ordering Through WhatsApp",
      text: "Choose a product and send your order request directly to our team.",
      cta: "Shop Now",
      ctaLink: "/products",
      desktopImage: "/assets/hero/hero-mobility-desktop.webp",
      mobileImage: "/assets/hero/hero-mobility-mobile.webp",
    },
  ],

  // ── Promotional Banners ────────────────────────────────────
  promoBanners: [
    {
      id: 1,
      heading: "Products from Leading Electronics Brands",
      text: "Explore appliances and electronics from Haier, Dawlance, Orient, Canon, and Atlas Honda at A H Electronics.",
      cta: "View All Products",
      ctaLink: "/products",
      desktopImage: "/assets/promo/promo-authorized-electronics-desktop.webp",
      mobileImage: "/assets/promo/promo-authorized-electronics-mobile.webp",
    },
    {
      id: 2,
      heading: "Need Help Choosing?",
      text: "Our team is available on WhatsApp (0323-1469205) to help you find the right product.",
      cta: "Chat on WhatsApp",
      ctaLink: "whatsapp",
      desktopImage: "/assets/promo/promo-whatsapp-assistance-desktop.webp",
      mobileImage: "/assets/promo/promo-whatsapp-assistance-mobile.webp",
    },
  ],

  // ── Why Choose Us ──────────────────────────────────────────
  benefits: [
    {
      icon: "Package",
      title: "Wide Product Selection",
      description: "Refrigerators, ACs, TVs, washing machines, kitchen appliances, and motorcycles.",
    },
    {
      icon: "Award",
      title: "Leading Electronics Brands",
      description: "Products from Haier, Dawlance, Orient, Canon, and Atlas Honda.",
    },
    {
      icon: "MessageCircle",
      title: "Direct WhatsApp Assistance",
      description: "Get product info, confirm prices, and place orders directly through WhatsApp.",
    },
    {
      icon: "Search",
      title: "Easy Product Enquiry",
      description: "Browse, compare specifications, and enquire about any product quickly.",
    },
  ],

  // ── Category Configuration ─────────────────────────────────
  categories: [
    {
      name: "Refrigerators",
      slug: "refrigerators",
      image: "/assets/category/refrigerators.webp",
      icon: "Refrigerator",
    },
    {
      name: "Air Conditioners",
      slug: "air-conditioners",
      image: "/assets/category/air-conditioners.webp",
      icon: "Wind",
    },
    {
      name: "Washing Machines",
      slug: "washing-machines",
      image: "/assets/category/washing-machines.webp",
      icon: "WashingMachine",
      subcategories: ["Fully Automatic", "Semi Automatic", "Top Load", "Front Load", "Twin Tub"],
    },
    {
      name: "LED TVs",
      slug: "led-tvs",
      image: "/assets/category/led-tvs.webp",
      icon: "Tv",
    },
    {
      name: "Deep Freezers",
      slug: "deep-freezers",
      image: "/assets/category/deep-freezers.webp",
      icon: "Snowflake",
    },
    {
      name: "Water Dispensers",
      slug: "water-dispensers",
      image: "/assets/category/water-dispensers.webp",
      icon: "GlassWater",
    },
    {
      name: "Microwave Ovens & Air Fryers",
      slug: "microwave-ovens-air-fryers",
      image: "/assets/category/microwave-air-fryers.webp",
      icon: "CookingPot",
    },
    {
      name: "Kitchen & Small Appliances",
      slug: "kitchen-small-appliances",
      image: "/assets/category/kitchen-small-appliances.webp",
      icon: "ChefHat",
      subcategories: [
        "Juicers",
        "Blenders",
        "Food Processors",
        "Kettles",
        "Irons",
        "Cooking Appliances",
        "Other Small Appliances",
      ],
    },
    {
      name: "Motorcycles",
      slug: "motorcycles",
      image: "/assets/category/motorcycles.webp",
      icon: "Bike",
    },
    {
      name: "Spare Parts & Accessories",
      slug: "spare-parts-accessories",
      image: "/assets/category/spare-parts-accessories.webp",
      icon: "Wrench",
    },
  ],

  // ── Brand Configuration ────────────────────────────────────
  brands: [
    { name: "Haier", slug: "haier", logo: "/assets/branding/brand-haier.svg" },
    { name: "Dawlance", slug: "dawlance", logo: "/assets/branding/brand-dawlance.svg" },
    { name: "Orient", slug: "orient", logo: "/assets/branding/brand-orient.svg" },
    { name: "Canon", slug: "canon", logo: "/assets/branding/brand-canon.svg" },
    { name: "Atlas Honda", slug: "atlas-honda", logo: "/assets/branding/brand-atlas-honda.svg" },
  ],

  // ── Quick Links for Footer ─────────────────────────────────
  quickLinks: [
    { label: "Home", href: "/" },
    { label: "All Products", href: "/products" },
    { label: "Special Offers", href: "/offers" },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ],

  supportLinks: [
    { label: "Warranty & Services", href: "/warranty-services" },
    { label: "FAQ", href: "/faq" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Contact Us", href: "/contact" },
  ],

  // ── FAQ Content ────────────────────────────────────────────
  faq: [
    {
      question: "How do I place an order?",
      answer:
        "Browse our products, select the item you want, and click 'Order on WhatsApp'. This will open WhatsApp with your order details pre-filled. Our team at A H Electronics will confirm the price, availability, and delivery details.",
    },
    {
      question: "Are the prices shown on the website final?",
      answer:
        "Prices and availability may change. Please confirm the latest price and stock status on WhatsApp before finalizing your order.",
    },
    {
      question: "What brands do you carry?",
      answer:
        "We offer products from leading electronics brands including Haier, Dawlance, Orient, Canon, and Atlas Honda.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "Payment details and methods are discussed and confirmed directly through WhatsApp when you place your order.",
    },
    {
      question: "Do you offer delivery?",
      answer:
        "Delivery options and charges are confirmed on WhatsApp based on your location and the product selected.",
    },
    {
      question: "What about warranty?",
      answer:
        "Warranty coverage depends on the product and manufacturer. Please confirm warranty details with our team on WhatsApp before placing your order.",
    },
    {
      question: "Can I visit your store in Lahore?",
      answer:
        "Yes, our showroom is located at 345 Lahore Road, Chowk Saddar Bazar, Lahore. You are welcome to visit during business hours.",
    },
    {
      question: "How do I check product availability?",
      answer:
        "You can check product availability by clicking the 'Ask About This Product' button on any product page, which will connect you with our team on WhatsApp at 0323-1469205.",
    },
  ],

  // ── About Page Content ─────────────────────────────────────
  about: {
    heading: "About A H Electronics",
    paragraphs: [
      "A H Electronics is a trusted electronics retailer located at 345 Lahore Road, Chowk Saddar Bazar, Lahore., offering a comprehensive range of home appliances, consumer electronics, kitchen appliances, and motorcycles from leading brands in Pakistan.",
      "We carry products from renowned brands including Haier, Dawlance, Orient, Canon, and Atlas Honda, covering categories such as refrigerators, air conditioners, washing machines, LED TVs, deep freezers, water dispensers, microwave ovens, kitchen appliances, and motorcycles.",
      "Our goal is to make electronics shopping simple and transparent. Browse our online catalog, compare specifications, and place your order directly through WhatsApp (0323-1469205). Our team is ready to assist you with product selection, pricing confirmation, and delivery arrangements.",
    ],
    image: "/assets/support/about-showroom.webp",
  },

  // ── Warranty Page Content ──────────────────────────────────
  warranty: {
    heading: "Warranty & Services",
    sections: [
      {
        title: "Product Warranty",
        content:
          "Warranty coverage depends on the specific product and its manufacturer. Each brand has its own warranty terms and duration. Please confirm warranty details for your chosen product with our team on WhatsApp before placing your order.",
      },
      {
        title: "Confirming Warranty Details",
        content:
          "Before purchasing, we recommend confirming the exact warranty period, what is covered, and any terms or conditions. The A H Electronics team can provide this information for any product in our catalog.",
      },
      {
        title: "After-Sales Support",
        content:
          "For any questions about your product after purchase, including warranty claims or service needs, please contact A H Electronics through WhatsApp. We will help connect you with the appropriate brand service center.",
      },
      {
        title: "Installation & Delivery",
        content:
          "Installation and delivery services may be available depending on the product and your location. Please confirm these details with our team when placing your order.",
      },
    ],
  },

  // ── Privacy Policy ─────────────────────────────────────────
  privacyPolicy: {
    heading: "Privacy Policy",
    lastUpdated: "September 2026",
    sections: [
      {
        title: "Information We Collect",
        content:
          "When you contact A H Electronics through WhatsApp or our website, we may collect your name, phone number, city, and product preferences to process your enquiry or order.",
      },
      {
        title: "How We Use Your Information",
        content:
          "We use your information solely to respond to your product enquiries, process orders, and provide customer support. We do not sell or share your personal information with third parties.",
      },
      {
        title: "Data Security",
        content:
          "We take reasonable measures to protect your personal information. WhatsApp conversations are protected by end-to-end encryption.",
      },
      {
        title: "Contact Us",
        content:
          "If you have any questions about our privacy practices, please contact A H Electronics through WhatsApp (0323-1469205) or email at ilyas2030@yahoo.com.",
      },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
export type CategoryConfig = (typeof siteConfig.categories)[number];
export type BrandConfig = (typeof siteConfig.brands)[number];
