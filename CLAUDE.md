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
docker build -t api:latest .
docker run -p 3333:3333 api:latest
```

No test or lint scripts are configured.

## Architecture

Single-file HTTP API (`src/server.ts`) using Node's native `http` module — no framework. The server listens on port 3333, routes `GET /` to "Hello World!", and 404s everything else.

Build output goes to `dist/` (TypeScript target: ES2024, module: nodenext). Path alias `@/*` maps to `./src/*`.

The Dockerfile uses `node:24-alpine3.20`, copies the full source, installs deps, builds, and runs `npm start`. Port 3333 is exposed.

## Purpose

This repo doubles as a Docker study portfolio. The `README.md` is the primary learning guide — it covers every concept and command from the study notes (intro through Docker Compose with PostgreSQL). When editing docs, keep the README as the single source of truth for anyone cloning the repo.

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
