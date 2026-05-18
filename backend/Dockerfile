FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --prod --frozen-lockfile

COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
