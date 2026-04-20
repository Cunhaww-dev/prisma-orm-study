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
