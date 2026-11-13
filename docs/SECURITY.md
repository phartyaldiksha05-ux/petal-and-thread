# Security Architecture, Controls & Known Risks

This document summarizes the security controls currently implemented in **Petal & Thread** as well as open development-mode risks that **must** be addressed before any public or production deployment.

---

## 1. Implemented Security Controls

### Backend API Authentication & Authorization (`server/middleware/auth.js`, `server/routes/*`)
- **Deterministic Token Classification (`classifyTokenType`)**: Inspects token headers solely to select the cryptographic verifier (`adminAuth.verifyIdToken` for RS256 Firebase tokens vs. `jwt.verify(..., { algorithms: ['HS256'] })` for local legacy admin tokens). Invalid or expired Firebase tokens fail with `401` and **never** fall back to legacy HMAC verification.
- **Fail-Closed Firebase Auth**: When Firebase Admin SDK is not initialized (offline mode), Firebase token routes return `503` rather than bypassing auth.
- **Public vs. Unapproved Product Isolation (`server/routes/products.js`)**:
  - `GET /api/products` returns **approved** products only to public callers.
  - `GET /api/products?includePending=true` strictly runs `requireAdmin`, returning `401`/`403` to unauthenticated users, customers, and non-admin sellers.
  - `GET /api/products/:id` returns unapproved products only to verified admins or the owning active seller (`requireSellerOrAdmin`).
- **Seller PII Protection (`server/routes/sellers.js`)**:
  - `GET /api/sellers/:id` projects profiles through `toPublicSellerProfile()`, returning only `active` storefronts and omitting private PII (`email`, `phone`, `adminNotes`, timestamps, and WhatsApp numbers unless `showWhatsapp === true`).
  - `PUT /api/sellers/me` prevents sellers from altering `status` or `isVerified`.
- **Authenticated File Upload Validation (`server/middleware/upload.js`, `server/routes/upload.js`)**:
  - Upload routes enforce `requireSellerOrAdmin`, a 5 MB file size limit, extension/MIME filtering, and binary magic-byte inspection (`validateImageMagicBytes` for JPEG, PNG, GIF, WebP) to reject spoofed file types.

### Cloud Firestore Security Rules (`firestore.rules`)
- **Custom-Claim Admin Checks**: `isAdmin()` checks `request.auth.token.admin == true` only — hardcoded email fallbacks are not used.
- **Private Seller Profiles (`seller_profiles/{sellerId}`)**: Direct reads are restricted to the owner (`isOwner(sellerId)`) or an admin (`isAdmin()`). Open self-registration enforces `status == 'pending'`, `isVerified == false`, strict field allowlists, and immutable `sellerId`, `status`, and `isVerified` on owner updates.
- **Strict Product Ownership (`products/{productId}`)**: Public reads are limited to `approved` documents. Only `isActiveSeller()` or admins can create/update/delete; sellers cannot self-approve, toggle `isFeatured`, reassign ownership, or write moderation fields.
- **Enquiries & Isolated Admin Notes**: `enquiries/{enquiryId}` requires cross-document verification of an active seller and approved product on create, allows reads only to customer, target seller, or admin, and forbids `adminNotes` inside customer/seller-readable documents — storing them in `admin_enquiry_notes/{enquiryId}` (`allow read, write: if isAdmin()`).
- **Schema-Validated Customer Wishlists (`wishlists/{userId}`)**: Owner-only reads/writes (`isOwner(userId)`), enforcing `request.time` on `updatedAt`, per-write delta bounds (`<= 1` create, `<= 100` max items with 1 add/update or 1 removal per update), strict item field validation, prototype-pollution key blocks (`__proto__`, `constructor`, `prototype`), and rejection of `data:` image URIs.

### Secret & Bootstrap Hygiene (`server/middleware/auth.js`, `server/database.js`, `AdminLogin.jsx`)
- **Strict `JWT_SECRET` Enforcement**: `getJwtSecret()` requires a non-placeholder `JWT_SECRET` of at least 16 characters with **no hardcoded fallback**. If `JWT_SECRET` is missing or invalid, legacy admin login and legacy token verification fail closed with HTTP `503` (and `server/index.js` exits with code `1` at startup when `NODE_ENV=production`).
- **Environment-Based Admin Bootstrap**: Hardcoded default admin credentials and the login screen credential hint have been removed. Initial local admin creation uses `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_USERNAME` and `ADMIN_BOOTSTRAP_PASSWORD` only when `db.admins` is empty, preserving any existing local admin accounts.

### Backend Server Startup Safety (`server/index.js`)
- Express 5 `app.listen(PORT, (err) => ...)` explicitly checks `err`, logs the failure, and exits with status `1` instead of silently ignoring bind errors like `EADDRINUSE`.

---

## 2. Known Development Risks & Unresolved Pre-Production Issues

These items remain open and **must** be addressed before deploying publicly:

1. **Rotate Any Legacy Sample Secrets in Local `.env` / Existing `store.json` Admin Passwords**:
   - Ensure local `.env` / `server/.env` files use newly generated high-entropy `JWT_SECRET` values (not copied from older examples) and rotate any previously seeded local admin passwords before non-local use.
2. **Unpublished `firestore.rules`**:
   - Local rules in `firestore.rules` do not protect Cloud Firestore until deployed to your Firebase project via Firebase CLI (`firebase deploy --only firestore:rules,firestore:indexes`).
3. **Missing Production Hardening Middleware**:
   - `server/index.js` uses permissive default `cors()` and does not include rate limiting (e.g., on `/api/auth/login`, `/api/enquiries`, `/api/sellers/register`), `helmet` security headers, or HTTPS enforcement.
4. **Single-File JSON Persistence (`server/data/store.json`)**:
   - File-based JSON storage has no multi-process locking, audit logging, or encrypted-at-rest storage and is unsuitable for production deployments.
