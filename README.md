# Petal & Thread — Handcrafted Boutique, Atelier & Artisan Platform

Petal & Thread is a full-stack web application built for an independent handcrafted crochet, bespoke fashion, and botanical illustration brand. It pairs a public customer boutique with an owner administration portal and an artisan partner studio workflow.

> **Project Status:** **Active Development / Portfolio Project.** Built for local development and portfolio demonstration. Payment gateway integration and production deployment are **not** implemented.

---

## Documentation Index

- [Setup & Environment Guide](docs/SETUP.md) — Local installation, `dotenv` loading behavior, Firebase/Cloudinary options, and CLI scripts
- [Features Overview](docs/FEATURES.md) — Detailed breakdown of offline-ready features vs. configuration-dependent integrations
- [Security Architecture & Audit](docs/SECURITY.md) — Implemented authorization controls, Firestore rules, and pre-production hardening items
- [Manual Testing Checklist](docs/TESTING.md) — End-to-end verification checklist across Customer, Seller, Admin, and API boundaries
- [Contributing Guidelines](CONTRIBUTING.md) — Development workflow and repository hygiene standards

---

## Implemented vs. Configuration-Dependent Features

Because the backend supports running in **local offline mode** without cloud credentials, application capabilities fall into two categories:

### Implemented & Available in Local Offline Mode
- **Public Customer Boutique (`/`)**:
  - Single-page editorial storefront (`Hero`, `Categories`, `FeaturedProducts`, `FashionStudio`, `ArtGallery`, `About`, `CustomOrders`, `InstagramGallery`, `Footer`).
  - Category filtering, quick-view product modal with material/dimension specs and strikethrough discounts, and INR (`₹`) formatting (`Intl.NumberFormat('en-IN')`).
  - **Guest Wishlist ("Saved Treasures")**: Add/remove saved items in browser `localStorage` with live INR total calculation.
  - **Enquiry Workflows**: Custom Order request modal saved to local JSON development storage (`POST /api/enquiries`), plus pre-filled WhatsApp enquiry links for individual items and wishlists.
- **Owner Admin Dashboard (`/admin` & `/admin/login`) — Legacy Local Auth Path**:
  - Protected routes using local admin JWT (`HS256` with `bcryptjs` verification against the local admin store).
  - **10 Admin Views**: Overview (`₹` revenue/orders/low-stock summary), Products & Curation (CRUD + `All`, `Pending`, `Approved`, `Rejected` filter tabs), Artisan Partners management UI, Categories, Fashion Portfolio, Art Gallery, Orders, Custom Enquiries, Inventory, and Website Settings.
  - Local catalog updates and product moderation persisted in local JSON storage.
- **Local Media Uploads**:
  - Authenticated image uploads saved to `server/uploads/` via Multer with a 5 MB limit and binary magic-byte inspection (JPEG, PNG, GIF, WebP).

### Optional / Configuration-Dependent Features
The following features depend on external Firebase or Cloudinary configuration and are **not fully operational in the default offline configuration**:

- **Firebase Admin SDK Integration (Requires Valid Service-Account Credentials)**:
  - Verifying Firebase ID tokens on Express API routes (`requireAuth`, `requireSellerOrAdmin`, Firebase-backed `requireAdmin`), syncing seller and product moderation updates to Cloud Firestore, and running admin CLI scripts (`setAdminRole.js`, `seedFirstSeller.js`, `migrateLegacyData.js`) **require valid Firebase Admin SDK service-account credentials** (`server/config/serviceAccountKey.json` or `GOOGLE_APPLICATION_CREDENTIALS`).
  - Without valid service-account credentials, the Express server runs in local offline mode and returns HTTP `503` for Firebase-authenticated API requests.
- **Artisan / Seller Registration, Authentication & Moderation Workflow**:
  - Although the frontend views (`/seller/dashboard`, Artisan Partner sign-up tab in `AuthModal`, `/admin/sellers`) and backend routes (`/api/sellers/*`, `/api/moderation/*`) exist in the codebase, **live seller registration, Firebase-based seller authentication, end-to-end moderation, and Firestore synchronization are not operational in offline mode** without Firebase Web SDK credentials, Firebase Admin service-account credentials, and deployed Firestore rules.
- **Customer Firebase Auth & Cloud Wishlist Sync**:
  - Customer sign-in and sign-up require valid `VITE_FIREBASE_*` Web SDK credentials with Email/Password authentication enabled.
  - Cloud wishlist persistence (`wishlists/{userId}`) also requires deploying `firestore.rules` to your Firebase project; against locked-down/default rules, wishlist saves fail over to local caching.
- **Cloudinary Server-Signed Uploads**:
  - Requires valid `CLOUDINARY_*` credentials; otherwise, media uploads use local disk storage (`server/uploads/`).

---

## Technology Stack

- **Frontend**: React 19, Vite 8, React Router 7, Tailwind CSS 3, Framer Motion, Lucide React, Firebase Web SDK (`firebase`)
- **Backend**: Node.js, Express 5, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`, `concurrently`
- **File Uploads**: Multer (local disk storage) + optional Cloudinary SDK (`cloudinary`)
- **Optional Cloud Services**: Firebase Authentication, Cloud Firestore (`firestore.rules`, `firestore.indexes.json`), Firebase Admin SDK (`firebase-admin`)
- **Local Development Storage**: JSON file persistence (`server/data/store.json`) via `server/database.js` using atomic write-and-rename (`fs.writeFileSync` + `fs.renameSync`) — **strictly for local development, not a production database**

---

## Project Architecture

```text
petal-and-thread/
├── docs/                       # Setup, feature status, security, and manual testing docs
├── src/
│   ├── admin/                  # Protected owner portal (10 management pages + layout)
│   ├── seller/                 # Artisan partner dashboard & SellerProtectedRoute
│   ├── components/             # Public storefront sections, Navbar, AuthModal, ProductModal, WishlistDrawer, CustomOrderModal
│   ├── config/                 # brandConfig.js (INR settings & fallback catalog) & firebase.js
│   ├── context/                # AuthContext, SiteDataContext, WishlistContext
│   ├── services/               # REST API client with Firebase ID token / legacy JWT resolution
│   └── utils/                  # Shared INR formatter (src/utils/currency.js)
├── server/
│   ├── config/                 # env.js (.env loader), firebaseAdmin.js & cloudinary.js
│   ├── middleware/             # auth.js (token classification, strict JWT_SECRET & role guards) & upload.js (Multer)
│   ├── routes/                 # auth, products, moderation, sellers, orders, enquiries, categories, fashion, artGallery, settings, upload
│   ├── scripts/                # CLI tools: setAdminRole.js, seedFirstSeller.js, migrateLegacyData.js
│   ├── data/                   # Runtime store.json (gitignored) & store.seed.json
│   ├── uploads/                # Local uploaded assets (gitignored)
│   ├── database.js             # Local development JSON store loader, env admin bootstrap & atomic saveDb
│   └── index.js                # Express 5 entrypoint & listen error handler
├── firestore.rules             # Role- and schema-validated Firestore Security Rules
├── firestore.indexes.json      # Firestore composite index definitions
├── .env.example                # Frontend Vite environment variable template
└── server/.env.example         # Backend Express environment variable template
```

**Request & Auth Flow:**
- In development (`npm run dev`), Vite runs on `http://127.0.0.1:3000` and proxies `/api` and `/uploads` requests to the Express API on `http://localhost:5000` (`vite.config.js`).
- `src/services/api.js` sends either the active Firebase ID token or the legacy admin JWT in `Authorization: Bearer <token>`.
- `server/middleware/auth.js` inspects token structure solely to choose the cryptographic verifier (`adminAuth.verifyIdToken` for RS256 Firebase tokens vs. `jwt.verify` for HS256 legacy admin tokens) and never trusts unverified claims.

---

## Local Installation & Setup

### Prerequisites
- **Node.js** (v20+ recommended; verified locally on v22.16.0)
- **npm** (v10+)
- Optional: A Firebase project + Admin SDK service-account JSON, and/or a Cloudinary account

### 1. Clone and Install
```bash
git clone <your-repository-url>
cd petal-and-thread
npm install
```

### 2. Configure Environment Variables (`dotenv` Behavior)
- Vite loads `VITE_*` variables from the **repository root `.env`** file (`.env.example`).
- Express loads environment variables via `server/config/env.js` from **both** `<repo-root>/.env` and `server/.env` (`server/.env.example`), regardless of whether you start commands from the repository root (`npm run dev`, `npm run server`) or from `server/`. Existing shell `process.env` values take precedence, followed by root `.env`, then `server/.env`.
- Always set a strong random `JWT_SECRET` (minimum 16 characters; there is no fallback secret) and never commit `.env`, `server/.env`, `serviceAccountKey.json`, or runtime `server/data/store.json`.
- To initialize a first local admin account on a fresh `store.json`, set `ADMIN_BOOTSTRAP_EMAIL` (or `ADMIN_BOOTSTRAP_USERNAME`) and `ADMIN_BOOTSTRAP_PASSWORD` (minimum 8 characters) in `.env` or `server/.env`.
- For full configuration details, see [docs/SETUP.md](docs/SETUP.md).

### 3. Run the Application
```bash
npm run dev         # Starts Express API (:5000) + Vite client (127.0.0.1:3000)
```

Other available scripts in `package.json`:
```bash
npm run server      # Express backend only (http://localhost:5000)
npm run dev:client  # Vite frontend only
npm run build       # Production static bundle output to dist/
npm run preview     # Preview built dist/ bundle locally
```

---

## Environment Variables (Placeholders Only)

### Frontend (`VITE_*` in root `.env`)
| Variable | Purpose | Example Placeholder |
| --- | --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key (optional offline) | `<your-firebase-api-key>` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain | `<your-project>.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | `<your-firebase-project-id>` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket | `<your-project>.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `<your-messaging-sender-id>` |
| `VITE_FIREBASE_APP_ID` | Firebase Web app ID | `<your-firebase-app-id>` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Public Cloudinary cloud name (optional) | `<your-cloud-name>` |
| `VITE_API_URL` | Express API base URL | `http://localhost:5000/api` |

### Backend (`server/.env` or root `.env`)
| Variable | Purpose | Example Placeholder |
| --- | --- | --- |
| `PORT` | Backend listening port (default `5000`) | `5000` |
| `NODE_ENV` | Runtime environment | `development` |
| `JWT_SECRET` | Required signing secret for legacy admin JWTs (min 16 chars, no fallback) | `<your-long-random-jwt-secret>` |
| `ADMIN_BOOTSTRAP_USERNAME` | Optional initial local admin username (only when no admin exists) | `<your-admin-username>` |
| `ADMIN_BOOTSTRAP_EMAIL` | Optional initial local admin email (only when no admin exists) | `<your-admin-email>` |
| `ADMIN_BOOTSTRAP_PASSWORD` | Optional initial local admin password (min 8 chars, only when no admin exists) | `<your-strong-local-password>` |
| `ADMIN_BOOTSTRAP_NAME` | Optional initial local admin display name | `Atelier Administrator` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (optional) | `<your-cloud-name>` |
| `CLOUDINARY_API_KEY` | Cloudinary API key (optional) | `<your-cloudinary-api-key>` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret (server-only, optional) | `<your-cloudinary-api-secret>` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to Firebase service-account JSON (required for Firebase Admin SDK) | `./server/config/serviceAccountKey.json` |
| `FIREBASE_PROJECT_ID` | Firebase project ID for Admin SDK | `<your-firebase-project-id>` |

---

## Current Development Status & Known Limitations

- **Local Development Storage Only**: `server/data/store.json` is single-file JSON persistence for local development and demos; it is not a production database.
- **Offline Mode Limitations**: Without valid Firebase Admin SDK service-account credentials (`serviceAccountKey.json`), Firebase token verification and Firestore sync are inactive (`503` on Firebase-protected API endpoints), so seller registration, Firebase auth, live seller moderation, and Firestore sync are unavailable out-of-the-box offline.
- **No Payment Gateway / Production Deployment**: Purchasing is enquiry-driven (WhatsApp & Custom Order requests); automated payment processing and production hosting are not implemented.
- **Firestore Rules Require Deployment**: `firestore.rules` and `firestore.indexes.json` live in the repository and must be published to your Firebase project before Cloud Firestore client features will succeed.
- **No Automated Test Runner**: `package.json` includes build/dev scripts only; verification uses manual checks, `node --check`, and `npm run build`.

---

## Security Considerations

- **Product & Moderation Access**: Public `GET /api/products` returns approved products only; `GET /api/products?includePending=true` and `/api/moderation/*` enforce verified admin access (`401`/`403` when unauthorized).
- **Strict Token Routing**: Invalid/expired Firebase tokens are rejected immediately without falling back to legacy HMAC validation.
- **Seller PII Isolation**: `firestore.rules` restricts direct `seller_profiles/{sellerId}` reads to the owner or `admin: true` claim holders, and `GET /api/sellers/:id` returns a sanitized DTO (`toPublicSellerProfile`) for active sellers only.
- **Secret Enforcement & Clean Startup**: `server/middleware/auth.js` enforces `JWT_SECRET` without any hardcoded fallback (rejecting legacy JWT auth with `503` when misconfigured and halting startup in `NODE_ENV=production`). Local seed admin defaults are removed from `server/database.js` and `AdminLogin.jsx`; initial local admin setup uses `ADMIN_BOOTSTRAP_*` env vars only when no admin exists yet. See [docs/SECURITY.md](docs/SECURITY.md) for full details and remaining production hardening work.
