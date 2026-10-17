import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Manrope", "system-ui", "sans-serif"],
      },
      colors: {
        border: "#E6E8ED",
        input: "#E6E8ED",
        ring: "var(--brand-purple)",
        background: "var(--brand-canvas)",
        foreground: "#17212B",
        primary: {
          DEFAULT: "var(--brand-deep)",
          foreground: "var(--brand-white)",
          dark: "var(--brand-deep)",
        },
        secondary: {
          DEFAULT: "var(--brand-red-dark)",
          foreground: "var(--brand-white)",
        },
        destructive: {
          DEFAULT: "var(--brand-red-dark)",
          foreground: "var(--brand-white)",
        },
        muted: {
          DEFAULT: "var(--brand-canvas)",
          foreground: "#5E6976",
        },
        accent: {
          DEFAULT: "#F3EEEE",
          foreground: "var(--brand-red)",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#17212B",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#17212B",
        },
        navy: "var(--brand-deep)",
        "electric-blue": "var(--brand-purple)",
        "sky-blue": "#5E6976",
        whatsapp: "#25D366",
        "offers-red": "var(--brand-red)",
        "brand-deep": "var(--brand-deep)",
        "brand-purple": "var(--brand-purple)",
        "brand-red": "var(--brand-red)",
        "brand-red-dark": "var(--brand-red-dark)",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        pulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(37, 211, 102, 0.5)" },
          "50%": { boxShadow: "0 0 0 12px rgba(37, 211, 102, 0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.6s cubic-bezier(0.4,0,0.2,1) both",
        "fade-in": "fade-in 0.4s ease-out both",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        pulse: "pulse 2s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
