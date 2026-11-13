# Local Setup & Configuration Guide

This guide covers installing, configuring, and running **Petal & Thread** locally in either **Offline Development Mode** or **Firebase-Connected Mode**.

---

## 1. Prerequisites

- **Node.js** v20+ (verified locally on Node.js `v22.16.0`)
- **npm** v10+ (verified locally on npm `10.9.2`)
- *(Optional)* A **Firebase** project (Authentication + Cloud Firestore) and Admin SDK service account key
- *(Optional)* A **Cloudinary** account for cloud image uploads

---

## 2. Installation

```bash
git clone <your-repository-url>
cd petal-and-thread
npm install
```

---

## 3. Environment Variables & `dotenv` Loading Behavior

### How `dotenv` Loads `.env`
`server/config/env.js` loads environment variables in deterministic order:

- **Vite (`src/`)** reads `VITE_*` variables from **`<repo-root>/.env`**.
- **Express (`server/`)** loads both **`<repo-root>/.env`** and **`server/.env`** regardless of whether commands are started from the repository root (`npm run dev`, `npm run server`) or from `server/`. Existing shell `process.env` variables take precedence, followed by root `.env`, then `server/.env`.

**Recommended local setup:** Keep frontend `VITE_*` variables in `<repo-root>/.env` (from `.env.example`) and backend variables in `server/.env` (from `server/.env.example`) — or combine both in `<repo-root>/.env`.

> **Warning:** Never commit `.env`, `server/.env`, `serviceAccountKey.json`, or `server/data/store.json` to Git.

### Frontend Variables (`VITE_*` in root `.env`)
| Variable | Required | Description | Placeholder |
| --- | --- | --- | --- |
| `VITE_FIREBASE_API_KEY` | Optional (for Firebase Auth/Firestore) | Firebase Web API key; placeholder values keep Firebase disabled | `<your-firebase-api-key>` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Optional | Firebase Auth domain | `<your-project>.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Optional | Firebase project ID | `<your-firebase-project-id>` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Optional | Firebase Storage bucket | `<your-project>.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Optional | Firebase Cloud Messaging sender ID | `<your-sender-id>` |
| `VITE_FIREBASE_APP_ID` | Optional | Firebase Web app ID | `<your-firebase-app-id>` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Optional | Public Cloudinary cloud name | `<your-cloud-name>` |
| `VITE_API_URL` | Recommended | Express API base URL | `http://localhost:5000/api` |

### Backend Variables (`server/.env` or root `.env`)
| Variable | Required | Description | Placeholder |
| --- | --- | --- | --- |
| `PORT` | Optional (defaults to `5000`) | Express HTTP listen port | `5000` |
| `NODE_ENV` | Optional | Environment mode (`development`, `test`, `production`) | `development` |
| `JWT_SECRET` | **Required for legacy admin auth** | Signing secret for local legacy admin JWTs (min 16 chars; no fallback) | `<your-long-random-jwt-secret>` |
| `ADMIN_BOOTSTRAP_USERNAME` | Optional | Initial local admin username (used only when `store.json` has zero admins) | `<your-admin-username>` |
| `ADMIN_BOOTSTRAP_EMAIL` | Optional | Initial local admin email (used only when `store.json` has zero admins) | `<your-admin-email>` |
| `ADMIN_BOOTSTRAP_PASSWORD` | Optional | Initial local admin password (min 8 chars; used only when `store.json` has zero admins) | `<your-strong-local-password>` |
| `ADMIN_BOOTSTRAP_NAME` | Optional | Display name for bootstrapped local admin | `Atelier Administrator` |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary cloud name | `<your-cloud-name>` |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API key | `<your-cloudinary-api-key>` |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API secret (server-only) | `<your-cloudinary-api-secret>` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Optional (required for Admin SDK) | Path to Firebase service-account JSON | `./server/config/serviceAccountKey.json` |
| `FIREBASE_PROJECT_ID` | Optional (required for Admin SDK) | Firebase project ID | `<your-firebase-project-id>` |

> Note on `GOOGLE_APPLICATION_CREDENTIALS`: `server/config/firebaseAdmin.js` resolves relative paths against `server/config/`, `server/`, and `process.cwd()`, and also checks `server/config/serviceAccountKey.json`, `server/serviceAccountKey.json`, and `<repo-root>/serviceAccountKey.json` automatically.

---

## 4. Running in Offline Development Mode (No Cloud Keys Required)

Out of the box without real Firebase or Cloudinary credentials:
1. Ensure port `5000` is free (`server/index.js` exits with code `1` if port `5000` is already bound).
2. Run:
   ```bash
   npm run dev
   ```
3. Access:
   - **Storefront**: `http://127.0.0.1:3000/`
   - **Admin Login**: `http://127.0.0.1:3000/admin/login`
   - **Backend Health Check**: `http://127.0.0.1:5000/api/health` (also proxied at `http://127.0.0.1:3000/api/health`)

In offline mode, `server/database.js` initializes `server/data/store.json` from clean catalog/content seeds (with `admins: []` unless `ADMIN_BOOTSTRAP_*` variables are configured in `.env` or `server/.env`). Ensure `JWT_SECRET` is set to a random value of at least 16 characters if using legacy local admin login.

---

## 5. Optional: Connecting Firebase Authentication, Firestore & Admin SDK

To enable Firebase customer/seller accounts, cloud wishlist sync, and backend Firebase ID token verification:

1. **Firebase Web SDK**: Enable Email/Password authentication in Firebase Console and set real `VITE_FIREBASE_*` values in root `.env`.
2. **Firebase Admin SDK**: Download a service account JSON from Firebase Console → Project Settings → Service Accounts, and save it to `server/config/serviceAccountKey.json` (gitignored).
3. **Deploy Firestore Rules & Indexes**: Publish `firestore.rules` and `firestore.indexes.json` to your Firebase project via Firebase CLI before testing Cloud Firestore reads/writes.
4. **Optional Backend CLI Scripts** *(all require valid `serviceAccountKey.json`)*:
   - Assign `admin: true` custom claim to a Firebase user:
     ```bash
     node server/scripts/setAdminRole.js <user-email>
     ```
   - Bootstrap an active initial artisan seller profile:
     ```bash
     node server/scripts/seedFirstSeller.js --email=<email> --name="<store-name>" [--whatsapp="<number>"]
     ```
   - Migrate `server/data/store.json` items into Cloud Firestore (supports `--dry-run`):
     ```bash
     node server/scripts/migrateLegacyData.js --seller-id=<firebase-uid> [--dry-run]
     ```

---

## 6. Available npm Scripts

| Script | Command | Description |
| --- | --- | --- |
| `npm run dev` | `concurrently "node server/index.js" "vite --host 127.0.0.1 --port 3000"` | Starts both Express API (`:5000`) and Vite dev server (`:3000`) |
| `npm run server` | `node server/index.js` | Starts only the Express API |
| `npm run dev:client` | `vite` | Starts only the Vite client |
| `npm run build` | `vite build` | Builds static frontend assets into `dist/` |
| `npm run preview` | `vite preview` | Previews the built `dist/` bundle locally |
