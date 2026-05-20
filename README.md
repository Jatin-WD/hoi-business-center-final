# HOI Business Center

Full-stack React + Express app for HOI Business Center services, venues, packages, bookings, user auth, admin management, inquiries, and manpower submissions.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Express REST API
- Database: MySQL on Hostinger
- Auth: JWT with email/password and phone OTP

## Hostinger Deployment

Deploy this repository as a Hostinger Node.js web app from GitHub.

Use these app settings:

```text
Build command: npm run build
Start command: npm start
Startup file: app.js
Output directory: leave default / empty
```

The Express backend serves both:

```text
/api/*    Backend API
/*        React app from dist/
```

Required Hostinger environment variables:

```env
NODE_ENV=production
PORT=3000
DB_CLIENT=mysql
MYSQLHOST=your-hostinger-mysql-host
MYSQLPORT=3306
MYSQLUSER=your-hostinger-mysql-user
MYSQLPASSWORD=your-hostinger-mysql-password
MYSQLDATABASE=your-hostinger-mysql-database
JWT_SECRET=use-a-long-random-secret
FRONTEND_URL=https://your-hostinger-domain.com
REQUIREMENT_EMAIL=team@example.com
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
```

After the first deployment, run the seed command once from the Hostinger app terminal if available:

```bash
npm run init-db
```

If there is no terminal, redeploy once after setting the database variables. The backend also attempts to initialize/seed the database on startup.

## Local Development

Create `backend/.env` with MySQL credentials, then run:

```bash
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend health:

```text
http://localhost:5000/api/health
```

## Quality Checks

```bash
npm run lint
npm run build
```

## Admin

The admin panel manages website users, admins/editors, page content, venues, services, packages, events, manpower roles, requirements/submissions, theme colors, and uploaded admin/manpower files.
