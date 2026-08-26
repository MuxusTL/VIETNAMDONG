# LinkNet — Vercel deployment

This package contains a Vercel adapter for the existing React + Express project.

## Important database limitation

The project currently uses `better-sqlite3` with `data/linknet.db`. Vercel serverless instances do **not** provide persistent writable storage. Do not treat this as a production database deployment: balances, users, withdrawals and other writes can be lost or diverge between instances.

For production, migrate the database to PostgreSQL (Neon is a straightforward option) before relying on Vercel for the API.

## Vercel settings

- Root directory: repository root
- Build command: `npm run build:client`
- Output directory: `server/public`
- Node.js: 22.x

`vercel.json` already configures the Express API function and SPA routing.

## Environment variables

Add the required values from `.env.example` in Vercel Project Settings. At minimum, set a strong `JWT_SECRET` and replace the old local `CLIENT_URL` / `API_BASE_URL` values with your deployed domain.

If using the current `/linknet` base path, keep `BASE_PATH=/linknet` and `VITE_BASE_PATH=/linknet`. For a normal root deployment, use empty base paths instead.

Do not upload `.env` to the repository.

## Discord bot

The Discord bot is a long-running process and should run separately on a VPS/Railway/Render/etc. Point its `API_BASE_URL` to this Vercel deployment.
