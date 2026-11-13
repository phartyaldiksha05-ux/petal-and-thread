# Features Overview

This document distinguishes between features that work out-of-the-box in **local offline mode** and features that **depend on external Firebase or Cloudinary configuration**.

---

## 1. Customer Experience (`/`)

### Working in Local Offline Mode
- **Editorial Storefront Sections**:
  - Hero campaign banner (`Hero.jsx`) synced with Website Settings.
  - Shop by Category cards (`Categories.jsx`) that filter Featured Creations.
  - Featured Creations product grid (`FeaturedProducts.jsx`) showing approved products only, formatted in Indian Rupees (`₹` via `Intl.NumberFormat('en-IN')` in `src/utils/currency.js`), with badge indicators and discount pricing.
  - Fashion Studio showcase (`FashionStudio.jsx`), Art Gallery lightbox (`ArtGallery.jsx`), Meet the Creator story (`About.jsx`), Custom Orders section (`CustomOrders.jsx`), Instagram section (`InstagramGallery.jsx`), and Footer (`Footer.jsx`).
- **Product Quick-View Modal (`ProductModal.jsx`)**:
  - Displays full descriptions, materials, dimensions, variant tags, current & strikethrough INR prices, custom variation pre-fill, and a pre-populated WhatsApp enquiry link.
- **Guest Wishlist ("Saved Treasures" — `WishlistDrawer.jsx`, `WishlistContext.jsx`)**:
  - Toggle items with live navbar badge count, calculate estimated INR total, remove items, and launch a combined *"Enquire All on WhatsApp"* message.
  - Persists locally in browser `localStorage`.
- **Custom Order Commission Form (`CustomOrderModal.jsx`)**:
  - Submits bespoke order requests to `POST /api/enquiries` (stored in local `store.json`) and supports opening a pre-filled WhatsApp enquiry.

### Configuration-Dependent Customer Features
- **Customer Sign Up / Sign In (`AuthModal.jsx`)**:
  - Includes Email/Password Sign In and Sign Up with confirm-password validation and Firebase error mapping (`auth/invalid-credential`, `auth/wrong-password`, `auth/too-many-requests`, `auth/network-request-failed`, etc.).
  - **Requires** real `VITE_FIREBASE_*` credentials and Email/Password auth enabled in Firebase Console.
- **Cloud Wishlist Sync (`wishlists/{userId}`)**:
  - Merges guest items into Firestore upon authenticated sign-in and listens to real-time `onSnapshot` updates.
  - **Requires** Firebase Auth + deployed `firestore.rules`; if Firestore denies writes or is unconfigured, the UI surfaces an error/falls back to local state.

---

## 2. Artisan / Seller Experience (`/seller/dashboard`)

### Code Implemented vs. Runtime Dependencies
The UI (`AuthModal.jsx` Artisan Partner tab, `SellerDashboard.jsx`, `SellerProtectedRoute.jsx`) and backend routes (`/api/sellers/*`, `/api/products`, `/api/upload`) are implemented in the repository, **but are configuration-dependent and not operational in offline mode**:

- **Artisan Partner Registration (`POST /api/sellers/register`)**:
  - Creates a Firebase user via `AuthModal.jsx`, then submits store details to `POST /api/sellers/register`. Profiles always start with `status: "pending"` and `isVerified: false`.
  - **Requires** both Firebase Web SDK (`VITE_FIREBASE_*`) and Firebase Admin SDK (`serviceAccountKey.json`); in offline mode `requireAuth` fails closed with HTTP `503`.
- **Role-Gated Seller Dashboard (`/seller/dashboard`)**:
  - Pending or rejected applicants see status/review feedback; approved (`active`) artisans can view their own submissions (`GET /api/sellers/my-products`), filter by `all` / `approved` / `pending` / `rejected`, create or edit products (which reset to `pending` curation review), delete their own items, and upload product photos.
  - **Requires** active Firebase authentication and Firebase Admin SDK verification on the backend.

---

## 3. Owner / Admin Portal (`/admin` & `/admin/login`)

### Working in Local Offline Mode (via Legacy Admin JWT)
When signed in via `/admin/login` using the local admin store (`POST /api/auth/login`):
1. **Overview (`/admin/overview`)**: Total revenue (`₹`), order count, custom enquiry counters, low-stock alerts (`<= 5` units), and recent orders summary.
2. **Products & Curation (`/admin/products`)**: Full CRUD with `Price (₹) *` / `Original (₹)` inputs, featured flags, multi-image uploads, and curation filter tabs (`All`, `Pending` badge count, `Approved`, `Rejected` badge count) with Approve / Reject / Re-approve moderation actions (`/api/moderation/products/:id`).
3. **Artisan Partners (`/admin/sellers`)**: Admin UI to filter artisan records (`all`, `pending`, `active`, `rejected`), inspect profiles, add moderation notes, and update status *(live seller applications and Firestore sync require Firebase Admin SDK; local records can be viewed/managed offline)*.
4. **Categories (`/admin/categories`)**: Create and edit storefront categories and display ordering.
5. **Fashion Portfolio (`/admin/fashion`)**: Manage couture items, sketches, fabric specs, and custom-order availability.
6. **Art Gallery (`/admin/art-gallery`)**: Manage artwork entries, medium/dimensions, and featured flags.
7. **Orders (`/admin/orders`)**: View order table, inspect line-item subtotals and total value in `₹`, and update order/payment statuses and notes.
8. **Custom Enquiries (`/admin/enquiries`)**: Filter website enquiries by status, edit private studio notes, and open WhatsApp follow-ups.
9. **Inventory (`/admin/inventory`)**: Adjust stock quantities (`+`/`-`/numeric input), filter low/out-of-stock items, and toggle `Available` vs `Sold Out`.
10. **Website Settings (`/admin/settings`)**: Update brand text, contacts, social links, hero image, and logo live (`store.json`).

### Configuration-Dependent Admin Features
- **Firebase Claim-Based Admin Auth (`admin: true`)**: Verifying Firebase ID tokens on `/admin` and backend admin routes requires `serviceAccountKey.json` and assigning the custom claim via `server/scripts/setAdminRole.js`.
- **Firestore Dual-Write Sync**: Seller status updates and moderation actions only sync to Cloud Firestore when `firebase-admin` is initialized.
- **Cloudinary Media Uploads**: Server-signed uploads fall back to local `server/uploads/` disk storage unless valid Cloudinary credentials are configured.

---

## 4. Explicitly Not Implemented

- **Online Payment Gateway & Self-Service Checkout**: There is no Stripe/Razorpay integration or automated checkout cart; customer ordering is enquiry-based via WhatsApp and Custom Order submissions, and order records are created/updated through `/api/orders`.
- **Managed Production Database**: Persistence uses local `server/data/store.json` rather than PostgreSQL/MySQL or a primary Firestore data access layer for all routes.
- **Production Hosting / CI/CD Pipeline**: No production deployment, reverse proxy, or automated test runner is configured.
