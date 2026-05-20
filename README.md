# HOI Business Center

Full-stack React + Express app for HOI Business Center services, venues, packages, bookings, user authentication, inquiries, and manpower submissions.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Express REST API
- Database: PostgreSQL, including Supabase on Hostinger
- Auth: JWT with email/password

## Required API Surface

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/inquiries`
- `POST /api/manpower`
- `GET /api/venues`
- `GET /api/venues/:id`
- `GET /api/services`
- `GET /api/packages`
- `GET /api/packages/:id`
- `GET /api/events`
- `POST /api/bookings`
- `GET /api/bookings`

## Hostinger Deployment

Deploy this repository as a Hostinger Node.js web app from GitHub.

```text
Build command: npm run build
Start command: npm start
Startup file: app.js
Output directory: leave default / empty
```

Required environment variables:

```env
NODE_ENV=production
PORT=3000
DB_CLIENT=postgres
DATABASE_URL=postgresql://user:password@host:6543/postgres
DB_SSL=true
JWT_SECRET=use-a-long-random-secret
FRONTEND_URL=https://your-hostinger-domain.com
REQUIREMENT_EMAIL=team@example.com
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
```

The backend creates tables and seeds catalog data from `backend/data/seed-data.js` on startup. You can also run:

```bash
npm run init-db
```

## Local Development

Create `backend/.env` with PostgreSQL credentials, then run:

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`

Backend health: `http://localhost:5000/api/health`

## Quality Checks

```bash
npm run lint
npm run build
```
