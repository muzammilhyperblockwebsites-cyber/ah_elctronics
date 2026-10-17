/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.haier.com" },
      { protocol: "https", hostname: "www.haier.com" },
      { protocol: "https", hostname: "www.dawlance.com.pk" },
      { protocol: "https", hostname: "www.orient.com.pk" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "www.atlashonda.com.pk" },
      { protocol: "https", hostname: "canonappliances.com.pk" },
      { protocol: "https", hostname: "canonpk.com" },
    ],
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

module.exports = nextConfig;
