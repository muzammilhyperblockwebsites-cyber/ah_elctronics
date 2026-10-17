# Urban Armor — Next.js E-Commerce Platform

**Urban Armor** by Frugal Traders & Services is Pakistan's trusted supplier of industrial safety equipment — safety footwear, protective clothing, head protection, gloves, and eye & face protection. This is the full-stack Next.js web application powering the store.

---

## Tech Stack

- **Next.js 14** (App Router) with TypeScript
- **Prisma ORM** with MongoDB
- **NextAuth v5** for authentication
- **Tailwind CSS** with custom design system
- **Shadcn/ui** component library
- **Cloudinary** for image uploads
- **Nodemailer** for transactional emails
- **Recharts** for admin analytics

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```env
DATABASE_URL=             # MongoDB connection string
NEXTAUTH_SECRET=          # Random secret string
NEXTAUTH_URL=             # e.g. http://localhost:3000
NEXT_PUBLIC_BASE_URL=     # e.g. http://localhost:3000

SMTP_HOST=                # e.g. smtp.gmail.com
SMTP_PORT=                # e.g. 587
SMTP_USER=                # Your email address
SMTP_PASS=                # Your email app password

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

OPENROUTER_API_KEY=       # For AI chat assistant
```

### 3. Generate the MongoDB database client

The application uses MongoDB Atlas only. Set `DATABASE_URL` to your MongoDB
connection string, then generate the Prisma client:

```bash
npx prisma generate
```

### 4. (Optional) Seed sample data

```bash
npm run db:seed
```

### 5. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
urbanarmar/
├── app/
│   ├── (site)/            # Public-facing pages
│   │   ├── about/
│   │   ├── cart/
│   │   ├── categories/
│   │   ├── checkout/
│   │   ├── contact/
│   │   ├── faq/
│   │   ├── guest-checkout/
│   │   ├── login/
│   │   ├── order/[id]/
│   │   ├── products/
│   │   ├── products/[id]/
│   │   ├── profile/
│   │   ├── register/
│   │   ├── shop/
│   │   ├── track-order/
│   │   └── layout.tsx
│   ├── admin/             # Admin dashboard
│   │   ├── analytics/
│   │   ├── categories/
│   │   ├── home-stats/
│   │   ├── inquiries/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── settings/
│   │   ├── sla-stats/
│   │   ├── social-links/
│   │   ├── users/
│   │   └── layout.tsx
│   ├── api/               # API routes
│   └── layout.tsx
├── components/
│   ├── site/              # Site-specific components (Navbar, Footer, etc.)
│   ├── seo/               # Structured data / SEO components
│   └── ui/                # Shadcn/ui components
├── lib/                   # Prisma client, auth, mailer, SEO utilities
├── prisma/
│   └── schema.prisma      # Database schema
├── public/                # Static assets (logo, images)
└── store/                 # Zustand app store
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to MongoDB |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:reset -- --force` | ⚠️ Delete ALL data from database |
| `npm run db:fresh` | ⚠️ Reset + reseed (complete fresh start) |

> ⚠️ **WARNING**: `db:reset` and `db:fresh` permanently delete all data. Use with caution.

---

## Deployment (Vercel)

The `vercel-build` script runs `prisma generate && next build`. The `prisma db push` step is **not** part of the build — run it manually when the schema changes:

```bash
npm run db:push
```

Environment variables must be configured in the Vercel project dashboard before deploying.

---

## Admin Access

The admin dashboard is available at `/admin`. Default credentials are configured via the database seed or set directly in MongoDB.

- URL: `/admin/login`
- Roles: `Admin`, `Operator`, `Viewer`

---

## Features

- Full e-commerce flow — browse, cart, checkout (COD & bank transfer), order tracking
- Guest checkout with email confirmation
- Registered user accounts with order history
- Admin dashboard — products, categories, orders, users, analytics, site settings
- AI chat assistant (OpenRouter API)
- WhatsApp integration
- Transactional order emails (confirmation + status updates)
- SEO — metadata, Open Graph, structured data (Organization, Product, WebSite schemas)
- Cloudinary image uploads for products and payment screenshots
