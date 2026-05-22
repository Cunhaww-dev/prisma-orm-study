# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # TypeScript watch mode (tsx), hot reload on port 3333
npm run build    # Compile TypeScript to dist/
npm start        # Run compiled output (dist/server.js)
```

Docker:
```bash
docker compose up postgres -d   # start only postgres (recommended)
docker compose up -d            # start full stack (api + postgres)
docker compose down             # stop containers
docker compose down --volumes   # stop and wipe database
docker build -t api:latest .
docker run -p 3333:3333 api:latest
```

Prisma:
```bash
npx prisma init                          # initialize prisma in the project
npx prisma migrate dev --name <name>     # create and apply a migration
npx prisma migrate deploy                # apply pending migrations
npx prisma db push                       # sync schema without migration
npx prisma studio                        # open visual database browser
npx prisma generate                      # regenerate prisma client → output: src/generated/prisma/
npx prisma db seed                       # run prisma/seed.ts
npx prisma migrate reset                 # wipe and reapply all migrations
```

```bash
npm run lint     # ESLint (TypeScript) — no test scripts configured
```

## Architecture

HTTP API (`src/server.ts`) using **Express 5**. Routes are organized in `src/routes/` with controllers in `src/controllers/`. Server listens on port 3333.

Build output goes to `dist/` (TypeScript target: ES2024, module: nodenext). Path alias `@/*` maps to `./src/*`.

The Dockerfile uses `node:24-alpine3.20`, copies the full source, installs deps, builds, and runs `npm start`. Port 3333 is exposed.

PostgreSQL runs via Docker Compose (`bitnami/postgresql:latest`) on port **5433** on the host (5432 inside the container). Credentials are loaded from `.env`.

Prisma schema lives at `prisma/schema.prisma`. The `DATABASE_URL` in `.env` must point to the running Postgres container before running any Prisma commands. Use `localhost:5433` from the host; use `postgres:5432` from inside a container.

## Prisma 7 — Driver Adapter

Prisma 7 requires a driver adapter. The project uses `@prisma/adapter-pg` with a `pg.Pool`. See `src/prisma.ts` for the implementation. Import the shared client from there; do not instantiate a new `PrismaClient` in controllers.

The CLI (migrations, studio) reads connection config from `prisma.config.ts` — the `url` field is **not** in `schema.prisma`.

## Purpose

This repo is a study project covering Docker and Prisma ORM together. The `README.md` is the primary learning guide — it covers Docker concepts (containers, volumes, Compose) and Prisma usage (schema, migrations, client). When editing docs, keep the README as the single source of truth for anyone cloning the repo.

## Study Notes (Obsidian Vault)

Detailed study notes live at:
```
/mnt/c/Users/DEV/Documents/Estudos - Backup 2/Docker/Cointainers/
├── 01 - Primeiros Passos com Docker/
├── 02 - Container e Imagem/
├── 03 - Volumes/
└── 04 - Docker Compose/
```

Use `/vault-doc` to create or update notes in the vault. The vault skill reads git diffs and raw content, formats them into Obsidian notes following the established pattern.
