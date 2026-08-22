# Agent Guide

## Commands

- Install dependencies with `npm ci`; `package-lock.json` is the tracked lockfile. `pnpm-lock.yaml` is ignored.
- Start the Vite dev server with `npm run dev` (normally `http://localhost:5173`).
- Run the available checks with `npm run lint` and `npm run build`. There is no test or typecheck script in `package.json`.
- Use `npm run preview` only to serve an already-created `dist/` build.

## Runtime Setup

- Each clone must create its own local ignored env file with `VITE_API_BASE_URL` and `VITE_API_VERSION`; the Axios client constructs its URL as `${VITE_API_BASE_URL}/api/${VITE_API_VERSION}`. The integration reference uses `http://localhost:8080` and `v1` for the gateway. Do not assume another user's `.env` exists.
- The frontend expects the gateway at port `8080` for API-backed flows. The backend is documented as an internal service at `8081`; do not point the browser directly at it unless the integration setup explicitly changes.
- `index.html` loads the external ePayco checkout script. Payment UI changes may require the gateway/backend sandbox to be available, not just Vite.

## Structure

- `src/main.jsx` mounts `AppErrorBoundary`, `BrowserRouter`, and `App`; `src/App.jsx` is the route and application-state composition root, wrapped by `AuthProvider`.
- API calls belong in `src/services/` and use the shared Axios client in `src/config/api.js`; the client adds the JWT from `localStorage` and redirects to `/login` on HTTP 401.
- Features are grouped under `src/components/<Feature>/`. Component styles are plain, co-located CSS files using BEM-like names; global reset/type styles are in `src/index.css` and the app shell is in `src/App.css`.
- Keep the manual route definitions in `src/App.jsx` in sync when adding a page. Product/catalog data can fall back to local mock data when the API is unavailable, but authenticated flows require the API.

## Conventions

- This is JavaScript/JSX with ES modules, not TypeScript. Keep new UI in React components and import plain CSS rather than introducing CSS Modules, Tailwind, CSS-in-JS, or a token pipeline.
- Prefer module imports for files under `src/assets/images`; use `public/` only for static root-served assets.
- Preserve the existing responsive tiers (`1100px`, `850px`, and `600px`) and component-local styling.
- Treat live code and `package.json` as authoritative for API behavior and available commands; local integration notes may not be present in a fresh clone.

## Verification

- Before handing off changes, run `npm run lint` followed by `npm run build`. Build output is generated in ignored `dist/`; do not commit it.
- No CI workflows, automated tests, or code-generation steps are configured in this repository.
