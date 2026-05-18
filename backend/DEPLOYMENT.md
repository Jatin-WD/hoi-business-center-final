# Backend Database Deployment

This backend is configured to use Docker MySQL for local development. It does not fall back to a local SQLite database.

## Recommended Setup

Local MySQL with Docker from the project root:

```bash
docker compose -f docker-compose.mysql.yml up -d
cd backend
npm run init-db
npm start
```

Use this local connection string:

```env
PORT=5000
DB_CLIENT=mysql
DATABASE_URL=mysql://hoi_user:hoi_password@127.0.0.1:3307/hoi_business_center
```

For production MySQL:

```env
DB_CLIENT=mysql
DATABASE_URL=mysql://hoi_user:strong_password@db-host:3306/hoi_business_center
```

## Install Dependencies

```bash
cd backend
npm install
```

## Railway Deployment

Railway cannot connect to your laptop Docker MySQL. Add a Railway MySQL service in the same project, then set backend variables:

```env
DB_CLIENT=mysql
MYSQL_URL=${{MySQL.MYSQL_URL}}
JWT_SECRET=long-random-secret
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

The repo includes `railway.json`; Railway will install backend dependencies, seed MySQL, start `backend/server.js`, and health-check `/api/health`.

## Initialize Schema and Seed Data

```bash
npm run init-db
```

`init-db` creates tables through `backend/config/schema.js` and seeds the existing project data.

The running app uses `backend/config/schema.js` as the source of truth for MySQL table creation.

## CI/CD

GitHub Actions runs:

- install frontend/backend dependencies
- start Docker MySQL
- seed schema/data
- start backend
- run `npm run lint`
- run `npm run build`
- run `npm run test:api`

Optional deploy hooks:

- `RENDER_DEPLOY_HOOK_URL`
- `VERCEL_DEPLOY_HOOK_URL`
