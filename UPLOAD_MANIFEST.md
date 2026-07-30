# HOI Business Center Upload Manifest

Use this as the strict commit/checklist for a clean repository upload.

## Upload These

### Root
- `app.js`
- `index.html`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `vite.config.ts`
- `tailwind.config.js`
- `postcss.config.js`
- `tsconfig.json`
- `eslint.config.js`
- `.eslintrc.cjs`
- `.prettierrc`
- `.prettierignore`
- `.npmrc`
- `vercel.json`
- `README.md`
- `.env.example`

### Source
- `src/**`
- `backend/**`
- `scripts/**`
- `.github/**` if you want CI/workflow files in the target repo

### Public Assets
Upload only the assets actually used by the site:
- `public/assets/hoi.png`
- `public/assets/hoi-booth-construction.jpg`
- `public/assets/hoi-booth-install.jpg`
- `public/assets/hoi-booth-setup.jpg`
- `public/assets/hoi-booth-video.mov`
- `public/assets/hoi-business-center.JPG`
- `public/assets/hoi-event-reg.jpg`
- `public/assets/hoi-team-candid.jpg`
- `public/assets/hoi-team-group.webp`
- `public/assets/hoi-team-opening.webp`
- `public/assets/yashobhoomi.png`

## Do Not Upload

### Build / Install Output
- `dist/`
- `node_modules/`
- `.pnpm-store/`

### Runtime / Local Data
- `.env`
- `backend/.env`
- `uploads/`
- `backend/uploads/`

### Temporary / Generated Files
- `_tmp_*`
- `tmp/`
- `docs/HOI_Business_Center_Developer_Report.html`
- `docs/HOI_Business_Center_Developer_Report.pdf`

### Removed Orphan Assets
- `public/assets/hall.jpg`
- `public/assets/hoi-about-team.jpg`
- `public/assets/hoi-team-ceremony.webp`
- `public/assets/hoi-team-group.jpg`

## Notes

- Keep `pnpm-lock.yaml` in sync with `package.json`.
- Keep the `public/assets` list strict. If a new image is added later, add it only when it is referenced by code.
- If you create a fresh repo from this codebase, initialize it from the source files above and ignore all build/runtime folders.
