# Testing Guide & Manual Verification Checklist

`package.json` does not currently include an automated test runner (e.g., Vitest, Jest, or Playwright). Use the checks and manual test matrix below before committing changes or evaluating features.

> **Note:** Listing a test case in this checklist does **not** mean it has been run or passed in the current environment; features marked *(Requires Firebase)* cannot pass in offline mode without valid Firebase configuration and deployed Firestore rules.

---

## 1. Automated Static Checks

Run from the repository root (`petal-and-thread/`):

```bash
# 1. Backend syntax check across all server JS files (PowerShell)
Get-ChildItem -Path server -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }

# 2. Frontend production bundle check
npm run build
```

---

## 2. Manual Verification Checklist

### A. Storefront & INR Currency Formatting
- [ ] Start `npm run dev` and open `http://127.0.0.1:3000/`.
- [ ] Verify all visible product cards show **approved** products only (no `pending`, `rejected`, or `draft` items).
- [ ] Verify product prices and strikethrough original prices display in INR (`₹`) with two decimal places and Indian comma grouping for values `>= 1,000` (e.g., `₹1,299.00`).
- [ ] Click a product card to open `ProductModal` and verify current price, original price, specs, and WhatsApp enquiry link formatting.
- [ ] Test category filter buttons in both `Categories` and `FeaturedProducts`.

### B. Wishlist (Guest & Cloud)
- [ ] *(Offline / Guest)* Toggle wishlist hearts on products, open the Saved Treasures drawer, verify individual `₹` prices, combined `Estimated Total:` in `₹`, item removal, and persistence across page refresh (`localStorage`).
- [ ] *(Requires Firebase + deployed `firestore.rules`)* Sign in as a Customer via `AuthModal`, add/remove wishlist items, confirm no `"Could not save item to cloud wishlist"` error, and verify persistence across reload/sign-out/sign-in.

### C. Customer & Artisan Authentication (`AuthModal`)
- [ ] *(Requires `VITE_FIREBASE_*`)* Test Customer Sign Up with mismatched Confirm Password → confirm validation message blocks submission.
- [ ] *(Requires `VITE_FIREBASE_*`)* Test Sign In with wrong password → confirm friendly invalid-credentials message (not `auth/network-request-failed`).
- [ ] *(Requires `VITE_FIREBASE_*` + Firebase Admin SDK)* Sign up via Artisan Partner tab, verify `POST /api/sellers/register` creates a `pending` seller, and confirm `/seller/dashboard` shows the pending-review gate.

### D. Artisan / Seller Dashboard *(Requires Firebase + Admin SDK)*
- [ ] Activate the test seller from `/admin/sellers`.
- [ ] Open `/seller/dashboard`, create a product, verify it starts in `pending` status and does **not** appear on the public storefront.
- [ ] Verify seller dashboard prices display in `₹` (`en-IN` formatting) and filters (`All`, `Approved`, `Pending`, `Rejected`) update properly.

### E. Owner Admin Portal (`/admin`)
- [ ] Log in at `http://127.0.0.1:3000/admin/login`.
- [ ] **Overview (`/admin/overview`)**: Verify Total Revenue displays `₹` with IndianRupee icon and Recent Orders totals show `₹`.
- [ ] **Products (`/admin/products`)**:
  - Verify `All`, `Pending`, `Approved`, and `Rejected` moderation filter tabs are visible and selectable.
  - Verify table prices and modal form labels (`Price (₹) *`, `Original (₹)`) use `₹`.
  - Test Approve / Reject / Re-approve workflows and refresh `/admin/products` to confirm state persists.
- [ ] **Inventory (`/admin/inventory`)**: Verify prices show `₹`, adjust stock (`+`/`-`/input), and toggle availability.
- [ ] **Orders (`/admin/orders`)**: Verify table totals, modal line-item subtotals, and total order value display in `₹`; test status updates.
- [ ] **Enquiries (`/admin/enquiries`)**: Submit a Custom Order request on `/` and confirm it appears in `/admin/enquiries`.
- [ ] **Website Settings (`/admin/settings`)**: Update brand tagline/settings and confirm live reflection on `/`.

### F. Backend API Authorization & Startup Regression
- [ ] Without an `Authorization` header, verify `GET http://127.0.0.1:5000/api/products` returns **`200`** with approved products only.
- [ ] Without an `Authorization` header (and with malformed/customer/non-admin tokens), verify `GET http://127.0.0.1:5000/api/products?includePending=true` returns **`401`** (unauthenticated/malformed) or **`403`** (non-admin).
- [ ] Verify unauthenticated `GET /api/sellers` and `GET /api/moderation/products` reject unauthorized callers (`401`/`403`).
- [ ] Start a second `node server/index.js` instance while port `5000` is already bound and verify it fails loudly with exit code `1` and an `EADDRINUSE` error rather than printing a running message or exiting `0`.
