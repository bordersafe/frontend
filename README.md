# VendOpay Frontend

VendOpay is an inter-state escrow application for Nigeria with AI-assisted dispute handling and a post-sale business wallet.

This repository contains the frontend implementation built with Next.js App Router.

## Project Status

Current state:
- Frontend scaffold is in place.
- Product blueprint and implementation constraints are documented.
- Next milestone is building the escrow-first user flows.

## Core Principle

Build and stabilize the escrow lifecycle first:
- Payment lock
- Baseline evidence capture
- Dispute arbitration visibility
- Resolution outcomes

Business wallet features are Phase 2 and must remain decoupled from escrow-critical behavior.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS

## Local Development

Install dependencies:

```bash
npm install
```

Create an .env.local file with at least:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_ENV=development
```

Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts

- npm run dev: run development server
- npm run build: build production bundle
- npm run start: run production build
- npm run lint: run lint checks

## Repository Docs

- Product and delivery blueprint: [docs.md](docs.md)
- Agent coding instructions for this repo: [.github/copilot-instructions.md](.github/copilot-instructions.md)
- Implementation backlog: [docs/implementation-backlog.md](docs/implementation-backlog.md)
- API contract guide: [docs/api-contracts.md](docs/api-contracts.md)
- Testing checklist: [docs/testing-and-demo-checklist.md](docs/testing-and-demo-checklist.md)
- Design system: [docs/design-system.md](docs/design-system.md)
- Color system: [docs/color-system.md](docs/color-system.md)

## Frontend Scope

Planned route families:
- Auth
- Dashboard
- Escrow creation and details
- Wallet actions

Planned component domains:
- Escrow timeline and status
- Camera-first capture input
- Wallet actions and confirmations
- Error, empty, and loading states

## End-to-End Flow Goal

Present a complete escrow journey from contract creation to either:
- successful seller release, or
- dispute-driven refund or human-review queue.

Then show one wallet action as the post-resolution extension.
