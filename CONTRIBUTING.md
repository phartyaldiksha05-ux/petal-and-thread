# Contributing to Petal & Thread

Thank you for your interest in contributing to **Petal & Thread**! This repository is an active-development portfolio project.

---

## Development Setup

1. Follow [docs/SETUP.md](docs/SETUP.md) to install dependencies and configure a local `.env` file.
2. Run the app locally with `npm run dev` (Express on `:5000`, Vite on `:3000`).

---

## Repository & Security Hygiene Rules

Before opening a pull request or pushing to GitHub:

- **Never commit secrets or private keys**: Do not stage or commit `.env`, `server/.env`, `serviceAccountKey.json`, or any Firebase Admin credentials.
- **Never commit runtime data or uploads**: Ensure `server/data/store.json`, `server/data/*.tmp`, `server/data/pgdata/`, `server/uploads/*` (except `.gitkeep`), `dist/`, and `node_modules/` remain untracked.
- **Preserve numeric storage**: Store monetary prices and totals as numbers in JSON/Firestore and format them for display using `formatPrice` from `src/utils/currency.js`.
- **Keep authorization fail-closed**: Never weaken `firestore.rules`, `server/middleware/auth.js`, or admin/seller role checks (`requireAdmin`, `requireSellerOrAdmin`, `requireAuth`).

---

## Before Submitting Changes

1. Run backend syntax validation across all files in `server/`:
   ```bash
   # PowerShell
   Get-ChildItem -Path server -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
   ```
2. Run a frontend production build:
   ```bash
   npm run build
   ```
3. Run the relevant manual checks in [docs/TESTING.md](docs/TESTING.md) and state clearly in your PR/commit summary which checks passed and any external services (e.g., Firebase) that were not exercised.
