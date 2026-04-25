# Vedic Vessels

A full-stack e-commerce platform for sacred ritual items — brass/copper diyas, puja sets, kalash, incense holders, and more. Built as a production-quality marketplace with a customer storefront, an admin dashboard, and a REST API backend.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Database](#database)
- [API Reference](#api-reference)
- [Admin Panel](#admin-panel)
- [Scripts](#scripts)

---

## Overview

| App | Description | Port |
|---|---|---|
| `backend/` | REST API — Node.js + Express + TypeScript + Prisma | 5000 |
| `frontend/` | Customer storefront — Next.js 16 + Tailwind CSS v4 | 3000 |
| `admin/` | Admin dashboard — Next.js 16 + Tailwind CSS v4 | 3001 |

This is a monorepo with three independent apps. There is no root `package.json` — each app is managed separately.

---

## Tech Stack

### Backend
- **Runtime:** Node.js 20
- **Language:** TypeScript (strict mode)
- **Framework:** Express.js 4
- **ORM:** Prisma 5
- **Database:** MySQL 8
- **Auth:** JWT (OTP-based login via phone number)
- **Payments:** Razorpay
- **Storage:** Cloudinary (product images)
- **Dev server:** ts-node-dev (hot reload)

### Frontend
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **State:** Zustand v5 (cart + auth, persisted to localStorage)
- **Toasts:** react-hot-toast
- **Fonts:** Cinzel (brand serif) + Inter (body) via `next/font/google`

### Admin
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Font:** Inter via `next/font/google`

---

## Features

### Customer Storefront
- **Homepage** — Hero banner, category strip, deal strip, trending/best-deals/featured product grids
- **Shop page** — Product listing with category filter (`/shop?category=Diyas`)
- **Product detail page** (`/product/[id]`) — Image gallery with hover zoom, MRP + discount display, stock status badge, Add to Cart / Buy Now
- **Cart** — Zustand-powered cart with quantity controls, per-item stock warnings, validity gating before checkout
- **Checkout** — Saved address picker (select from saved, or add new), Razorpay payment integration
- **OTP Login** — Phone-number-based OTP authentication, JWT session
- **My Orders** (`/my-orders`) — Full order history with status badges
- **Order Tracking** (`/orders/[id]`) — Amazon-style vertical 4-step timeline (Order Placed → Shipped → Out for Delivery → Delivered), auto-generated Shiprocket tracking URL, TrackingInfoCard with copy + open link
- **Profile** (`/profile`) — Edit name and email; phone is read-only
- **Saved Addresses** (`/profile/address`) — Add, edit, delete, and set default delivery addresses
- **Support Tickets** (`/support`) — Create tickets linked to orders, chat-style conversation view
- **Order Success page** — Post-payment confirmation

### Admin Dashboard
- **Dashboard** — Stats cards (total orders, revenue, products, users), recent orders table, quick actions
- **Products** — Full CRUD with multi-image upload to Cloudinary, MRP/price/discount management, stock control, category assignment, soft-delete toggle
- **Categories** — Create and toggle category active state, product count per category
- **Orders** — Orders table with status badges; Ship modal (enter Tracking ID + Courier, auto-generates Shiprocket URL); Mark Delivered; Order detail panel showing delivery address, items, total
- **Users** — User list with order count and role
- **Support** — Ticket list with ALL / OPEN / IN_PROGRESS / RESOLVED filter tabs; conversation modal with reply + status update

---

## Architecture

### Backend

```
Controller → Service → Database (via Prisma)
```

- `server.ts` — only starts the HTTP server
- `app.ts` — Express setup, CORS, route mount at `/api/v1`
- `common/config/env.ts` — owns `dotenv.config()`, exports typed config
- `common/lib/prisma.ts` — PrismaClient singleton (prevents connection leaks in dev)
- `common/middleware/` — `auth.ts` (JWT verify), `requireAdmin.ts`, `upload.ts` (multer), `logger.ts`
- `modules/<name>/` — each feature has its own `service`, `controller`, `routes`, and `types` file
- `routes/index.ts` — single mount point for all module routes

### Frontend

**Server components** (no `'use client'`): `HeroBanner`, `DealStrip`, `ShopFilters`, `layout.tsx`, `page.tsx`, `shop/page.tsx`, `product/[id]/page.tsx`

**Client components** (`'use client'`): `Navbar`, `CategoryStrip`, `ProductGrid`, `ProductCard`, `cart/page.tsx`, `checkout/page.tsx`, order/support/profile pages

**Data flow:**
- Server components fetch directly in the component body (async/await)
- Client components fetch via `useEffect` or service functions using `useAuthStore.getState().token`
- All Prisma `Decimal` fields are normalised to `Number` before use in the frontend

---

## Project Structure

```
vedic vessels/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # DB schema (7 models)
│   │   ├── seed.ts                 # 4 categories + 10 products
│   │   └── migrations/             # Prisma migration history
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── common/
│   │   │   ├── config/env.ts
│   │   │   ├── lib/
│   │   │   │   ├── prisma.ts
│   │   │   │   └── cloudinary.ts
│   │   │   └── middleware/
│   │   │       ├── auth.ts
│   │   │       ├── requireAdmin.ts
│   │   │       ├── upload.ts
│   │   │       └── logger.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── address/
│   │   │   ├── payment/
│   │   │   ├── support/
│   │   │   ├── user/
│   │   │   └── admin/
│   │   └── routes/index.ts
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── cart/
│       │   ├── checkout/
│       │   ├── login/
│       │   ├── my-orders/
│       │   ├── order-success/
│       │   ├── orders/[id]/
│       │   ├── product/[id]/
│       │   ├── profile/
│       │   │   └── address/
│       │   ├── shop/
│       │   └── support/
│       │       └── [id]/
│       ├── components/
│       │   ├── shared/
│       │   │   ├── Navbar.tsx
│       │   │   ├── ImageGallery.tsx
│       │   │   ├── OrderTimeline.tsx
│       │   │   ├── TrackingInfoCard.tsx
│       │   │   └── ...
│       │   └── ui/
│       │       ├── Button.tsx
│       │       └── ProductCard.tsx
│       ├── services/
│       │   ├── product.service.ts
│       │   ├── order.service.ts
│       │   ├── address.service.ts
│       │   ├── user.service.ts
│       │   ├── payment.service.ts
│       │   └── support.service.ts
│       ├── store/
│       │   ├── cart.store.ts
│       │   └── auth.store.ts
│       └── types/index.ts
│
└── admin/
    └── src/
        ├── app/
        │   ├── login/
        │   └── (admin)/
        │       ├── dashboard/
        │       ├── products/
        │       ├── categories/
        │       ├── orders/
        │       ├── users/
        │       └── support/
        ├── components/
        │   ├── layout/
        │   │   ├── Sidebar.tsx
        │   │   └── Header.tsx
        │   └── ui/
        └── services/
```

---

## Environment Variables

### `backend/.env`

```env
PORT=5000
DATABASE_URL=mysql://USER:PASSWORD@localhost:3306/vedic_vessels
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Copy from `backend/.env.example` and fill in your values.

### `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### `admin/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_ADMIN_SECRET=your_admin_secret
```

---

## Getting Started

> **Prerequisites:** Node.js 20+, MySQL 8 running locally, a Cloudinary account, and a Razorpay test account.

### 1. Clone the repo

```bash
git clone https://github.com/rahulshinde1203/Vedic-Vessels.git
cd "Vedic-Vessels"
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env          # fill in your values
npm install
npx prisma migrate deploy     # create all tables
npm run db:seed               # seed categories + products
npm run dev                   # starts on http://localhost:5000
```

Verify: `GET http://localhost:5000/api/v1/health` → `{ "success": true, "message": "Server running" }`

### 3. Set up the frontend

```bash
cd frontend
cp .env.local.example .env.local   # or create manually
npm install
npm run dev                         # starts on http://localhost:3000
```

### 4. Set up the admin dashboard (optional)

```bash
cd admin
cp .env.local.example .env.local
npm install
npm run dev                         # starts on http://localhost:3001
```

---

## Database

**ORM:** Prisma 5 | **DB:** MySQL 8

### Models

| Model | Description |
|---|---|
| `User` | Phone-based account; optional name + email; USER or ADMIN role |
| `Category` | Product categories with active toggle |
| `Product` | MRP, selling price, discount %, multi-image JSON array, stock, Cloudinary `imageUrl` |
| `Address` | Delivery addresses per user; `isDefault` flag; address snapshot stored on each order |
| `Order` | Links user + address; stores `deliveryAddress` text snapshot; tracking fields; `shipmentStatus` for Shiprocket |
| `OrderItem` | Line items per order (productId, quantity, price at time of purchase) |
| `SupportTicket` | User-raised tickets; optional orderId; OPEN / IN_PROGRESS / RESOLVED |
| `SupportReply` | Threaded replies on tickets; `isAdmin` flag |

### Enums

```
Role:          USER | ADMIN
OrderStatus:   PENDING | SHIPPED | DELIVERED
TicketStatus:  OPEN | IN_PROGRESS | RESOLVED
```

### Useful Prisma commands

```bash
cd backend
npm run prisma:generate   # regenerate client after schema changes
npm run prisma:migrate    # apply pending migrations
npm run prisma:studio     # open visual DB browser at :5555
npm run db:seed           # seed categories + 10 products
```

---

## API Reference

Base URL: `http://localhost:5000/api/v1`

All authenticated routes require: `Authorization: Bearer <token>`

### Auth

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/send-otp` | No | Send OTP to phone number |
| POST | `/auth/verify-otp` | No | Verify OTP, returns JWT |

### Products

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/products` | No | List all active products |
| GET | `/products/:id` | No | Get product by ID |

### Orders

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/orders` | User | Place a new order |
| GET | `/orders/my` | User | Get authenticated user's orders |
| GET | `/orders/:id` | User | Get a single order (must belong to user) |
| GET | `/orders/:id/track` | User | Get tracking info for an order |

### Addresses

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/address` | User | Add a new delivery address |
| GET | `/address` | User | List all addresses for user |
| GET | `/address/:id` | User | Get single address |
| PATCH | `/address/:id` | User | Update address |
| DELETE | `/address/:id` | User | Delete address |
| PATCH | `/address/:id/default` | User | Set as default address |

### User Profile

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/user/profile` | User | Get current user's profile |
| PATCH | `/user/profile` | User | Update name and/or email |

### Payment

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/payment/create-order` | User | Create Razorpay order |
| POST | `/payment/verify` | User | Verify payment signature + create DB order |

### Support

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/support` | User | Create a support ticket |
| GET | `/support/my` | User | List user's own tickets |
| GET | `/support/:id` | User | Get ticket with replies |
| POST | `/support/:id/reply` | User | Add a reply to a ticket |

### Admin

> All `/admin/*` routes require `ADMIN` role.

| Method | Route | Description |
|---|---|---|
| GET | `/admin/stats` | Dashboard stats |
| GET/POST | `/admin/products` | List products / Create product |
| PATCH/DELETE | `/admin/products/:id` | Update / soft-delete product |
| GET/POST | `/admin/categories` | List / create categories |
| GET | `/admin/orders` | List all orders |
| GET | `/admin/orders/:id` | Order detail |
| PATCH | `/admin/orders/:id` | Update status (SHIPPED/DELIVERED) + tracking |
| GET | `/admin/users` | List all users |
| GET | `/admin/support` | List all support tickets |
| GET | `/admin/support/:id` | Ticket detail with replies |
| PATCH | `/admin/support/:id` | Update ticket status |
| POST | `/admin/support/:id/reply` | Add admin reply |

### Order Tracking

When an admin marks an order as **SHIPPED**, the `trackingUrl` is **automatically generated**:

```
https://shiprocket.co/tracking/{trackingId}
```

No manual URL entry is required.

---

## Admin Panel

Access at `http://localhost:3001`

| Section | Capabilities |
|---|---|
| Dashboard | Live stats, recent orders, quick action shortcuts |
| Products | Create with multi-image upload, edit price/stock/description, toggle active, soft delete |
| Categories | Create, count products per category, toggle active |
| Orders | View all orders, mark as Shipped (enter tracking ID + courier), mark as Delivered, view delivery address |
| Users | Read-only user list with order count |
| Support | Filter by status, reply to tickets, update status, full conversation view |

---

## Scripts

### Backend

```bash
npm run dev              # hot-reload dev server on :5000
npm run build            # compile TypeScript to dist/
npm run start            # run compiled dist/server.js
npm run db:seed          # seed categories + products
npm run prisma:generate  # regenerate Prisma client
npm run prisma:migrate   # apply pending migrations
npm run prisma:studio    # Prisma Studio GUI at :5555
```

### Frontend / Admin

```bash
npm run dev      # development server with Turbopack
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint
```

### TypeScript checks

```bash
cd backend  && npx tsc --noEmit
cd frontend && npx tsc --noEmit
cd admin    && npx tsc --noEmit
```

### Kill ports

```bash
lsof -ti :5000 | xargs kill   # backend
lsof -ti :3000 | xargs kill   # frontend
lsof -ti :3001 | xargs kill   # admin
```

---

## Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `brand-gold` | `#C9A84C` | Primary CTAs, active states, badges |
| `brand-gold-dark` | `#A67C00` | Hover states |
| `brand-gold-light` | `#E8CC7A` | Subtle highlights |
| `brand-charcoal` | `#1E1A14` | Body text, nav strip |
| `brand-copper` | `#B87333` | Category labels, accent text |
| `brand-cream` | `#FFF8E7` | Warm background sections |

---

## Author

**Rahul Shinde**
GitHub: [rahulshinde1203](https://github.com/rahulshinde1203)
