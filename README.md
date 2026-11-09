# Petal & Thread — Handcrafted Boutique & Atelier Platform

A complete platform for an independent handmade creative fashion brand, featuring two distinct experiences:
1. **Public Customer-Facing Boutique Website** (`/`)
2. **Private Owner/Administrator Dashboard** (`/admin` & `/admin/login`)

---

## 🌸 Experiences Overview

### 1. Public Customer Boutique (`/`)
- **Brand Identity**: Soft, feminine, elegant and luxury editorial lookbook.
- **Sections**:
  1. Sticky Navigation Bar with Saved Treasures bag counter and mobile drawer.
  2. Hero Campaign (*"Little things, made with a lot of love."*).
  3. Shop by Category (5 curated cards with live filter links).
  4. Featured Products (Interactive product cards with wishlist toggle, quick view modal, and direct WhatsApp enquiry).
  5. Fashion Studio (Slow fashion couture garments, sketches, fabrics, and custom tailoring steps).
  6. Art Gallery (Asymmetrical portfolio of illustrations with lightbox).
  7. Meet the Creator (Personal workspace story, craft philosophy, and milestones).
  8. Custom Orders (Bespoke commissions with pre-filled WhatsApp link & request modal).
  9. Instagram Section (6-card visual journal).
  10. Footer (Navigation, contacts, WhatsApp, social links, and owner portal access).
- **Interactive Modals**:
  - Saved Treasures Wishlist Drawer with live calculation and *"Enquire All on WhatsApp"* button.
  - Product Details Modal with specifications and WhatsApp enquiry.
  - Custom Order Modal: Submissions save directly into the backend database for the admin!

### 2. Private Owner Admin Dashboard (`/admin`)
- **Protected Portal**: Access restricted to authenticated administrators via JWT tokens.
- **Login Page (`/admin/login`)**:
  - Secure login with bcrypt password verification.
  - Default Initial Credentials:
    - **Username**: `admin` (or `owner@petalandthread.com`)
    - **Password**: `atelier2026!`
- **Sidebar & Modules**:
  1. **Overview**: Live revenue, active orders, custom inquiries, catalog count, low stock warnings, and recent activity.
  2. **Products**: Full CRUD management. Add new products, upload multiple photos, set prices, discounts, categories, available stock, variants (colors, sizes), and featured flags.
  3. **Categories**: Create and edit categories (*Crochet Keychains, Crochet Flowers, Hair Accessories, Handmade Gifts, Clothing, Custom Creations*), change tags, cover photos, and descriptions.
  4. **Fashion Portfolio**: Upload finished garment photography and outfit sketches, enter fabric and sizing specs, and toggle custom order availability.
  5. **Art Gallery**: Upload fashion illustrations and gouache studies with titles, categories, dimensions, and featured flags.
  6. **Orders**: Track client orders, customer details, purchased items, total prices, payment status (*Paid, Pending, Refunded*), order status (*Pending, Processing, Crafting, Shipped, Delivered, Cancelled*), and studio notes.
  7. **Custom Enquiries**: Review custom creation requests submitted from the public website, filter by status (*New, In Discussion, In Progress, Completed, Archived*), view client requirements, and chat directly via WhatsApp.
  8. **Inventory**: Quick stock adjusters (+ / -), low stock notices (≤ 5 units), and availability toggles (*Available* vs *Sold Out*).
  9. **Website Settings**: Update brand name, tagline, WhatsApp phone number, contact email, social links, and homepage hero campaign photo. Changes update the public website live!

---

## 🛠️ Technology Stack & Architecture

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Lucide React, React Router Dom.
- **Backend**: Node.js & Express REST API (`petal-and-thread/server/`).
- **Database**: Persistent JSON relational datastore (`server/data/store.json`) with atomic transactions.
- **Authentication**: Signed JSON Web Tokens (JWT) with bcryptjs password hashing.
- **File Storage**: Persistent storage in `server/uploads/` with Multer MIME type (JPEG/PNG/WebP/GIF) and 5MB size validation.

---

## 🚀 How to Run

### Development Mode (Both Frontend + Backend)

From the project directory:
```powershell
cd C:\Users\HP\OneDrive\petal-and-thread
npm run dev
```

This starts:
- **Public Website & Admin Frontend**: [http://localhost:3000/](http://localhost:3000/)
- **Owner Admin Login**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api) (automatically proxied through port 3000)

### Production Build
```powershell
npm run build
```
Generates optimized, production-ready static assets in `dist/`.
