# HOI Business Center

Full-stack React + Express app for HOI Business Center services, venues, packages, bookings, user authentication, inquiries, manpower submissions, and admin workflows.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Express REST API on Firebase Functions or local Node.js
- Database: Firestore
- File storage: Firebase Storage for uploads, with local fallback in development
- Auth: Firebase Auth

## Runtime Behavior

- The public catalog prefers Firestore, but falls back to bundled seed data if Firestore is unavailable.
- This keeps the website usable locally even when the Firebase project has not enabled Firestore yet.
- The admin panel, auth, and writes still use the Firebase-oriented backend routes.

## Firebase Setup

Firebase Hosting serves the frontend, and `firebase.json` rewrites `/api/**` to the backend function.

Firebase deployment:

```bash
pnpm install
pnpm run build
firebase deploy --only hosting,functions
```

Firebase project:

- Project ID: `hoi-business-center`
- Hosting URL: `https://hoi-business-center.web.app`

Required Firebase-related env vars:

```env
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
FIREBASE_PROJECT_ID=hoi-business-center
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FRONTEND_URL=https://hoi-business-center.web.app
```

For local development, copy `.env.example` to `.env` and fill the values you need. If you use a Firebase service account JSON file, point `GOOGLE_APPLICATION_CREDENTIALS` to that file before starting the backend.

If you are deploying locally with the Firebase CLI, run:

```bash
firebase use hoi-business-center
```

## API Surface

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/inquiries`
- `POST /api/manpower`
- `GET /api/venues`
- `GET /api/venues/:locationId`
- `GET /api/venues/:locationId/:subVenueId`
- `GET /api/services`
- `GET /api/packages`
- `GET /api/packages/:category`
- `GET /api/packages/category/:category`
- `GET /api/packages/:category/:subcategory`
- `GET /api/events`
- `POST /api/bookings`
- `GET /api/bookings`

## Local Development

Create `.env` from `.env.example`, then run:

```bash
pnpm install
pnpm run dev
```

Frontend: `http://localhost:5173`
Backend health: `http://localhost:3000/api/health`

## Backend Notes

- The backend seeds Firestore CMS/catalog defaults on demand.
- If Firestore reads fail, public catalog routes fall back to the bundled seed catalog so the site keeps rendering.
- Uploaded admin images and manpower documents use Firebase Storage when the Firebase bucket is configured.
- The same codebase still runs locally with `pnpm start`, which is useful while Firebase is being rolled out.
- Create your first admin account with Firebase Auth and then promote it through the admin access flow if needed.

## Quality Checks

```bash
pnpm run lint
pnpm run build
```
