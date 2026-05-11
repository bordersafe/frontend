# BorderSafe Frontend Blueprint

This document is the source of truth for the BorderSafe hackathon frontend repository. It translates the product plan into an execution-ready delivery guide for engineering, demo prep, and judging review.

## 1) Product Vision

BorderSafe is an AI-assisted, cross-border escrow experience with human override controls for disputes and a post-resolution business wallet.

Primary value:
- Reduce cross-border trade risk for buyers and sellers.
- Use visual evidence and AI arbitration to speed dispute handling.
- Keep a strict financial state machine to prevent invalid transitions and double-spend behavior.

## 2) Scope Boundaries

### In Scope For This Frontend Repo
- Mobile-first Next.js app shell and page flows.
- User auth UI and escrow lifecycle interfaces.
- Capture-first UX for baseline and dispute media.
- Wallet actions UI that calls backend APIs.
- API client layer and state-driven UI rules.

### Out Of Scope For This Repo
- FastAPI business logic implementation.
- Database schema migrations and cron execution.
- Interswitch signature validation and webhook handling internals.

## 3) Non-Negotiable Constraints

- No-mock mandate for integrated flows: use real sandbox credentials and real backend endpoints in staging/demo environments.
- Escrow-first principle: complete Payment -> AI Check -> Resolution before scaling wallet extras.
- Mobile-first PWA feel: all core journeys must be smooth on narrow screens.
- Safety-first UX: risky actions must show state, confirmation, and idempotent behavior.

## 4) System Architecture (Frontend Perspective)

### Technology
- Next.js App Router (TypeScript).
- React 19.
- Tailwind CSS 4.

### Integration Topology
- Frontend (this repo) talks only to backend API routes.
- Backend orchestrates Interswitch, Gemini, Supabase, and Cloudinary.
- Frontend renders workflow state from backend-authoritative escrow and wallet records.

## 5) Canonical Domain Model (UI Contract)

### Escrow States
- DRAFT
- PAYMENT_LINK_CREATED
- FUNDS_SECURED
- BASELINE_CAPTURED
- IN_TRANSIT
- DELIVERED_PENDING_CONFIRMATION
- DISPUTED
- AWAITING_HUMAN_REVIEW
- RESOLVED_REFUNDED
- RESOLVED_RELEASED
- CANCELLED

### Allowed Transition Direction
- Escrow states are forward-only except explicit dispute branches.
- Frontend must hide or disable controls that would request illegal transitions.

### Arbitration Output Contract
- fault: SELLER | BUYER | COURIER
- reasoning: string
- confidence_score: number (0-100)

Frontend behavior:
- confidence_score > 90: show auto-resolution status.
- confidence_score <= 90: show awaiting human review state and timeline explanation.

## 6) End-To-End User Journeys

### Journey A: Create Contract And Lock Funds
1. Seller fills contract details.
2. Frontend sends contract payload for translation and escrow creation.
3. UI displays payment link status and payer instructions.
4. On webhook-processed success, UI updates to FUNDS_SECURED.

### Journey B: Baseline Capture
1. Seller opens capture flow (camera-first, rear camera preference).
2. Frontend uploads evidence via backend endpoint.
3. UI stores and displays evidence receipt and timestamp.
4. Escrow advances to BASELINE_CAPTURED.

### Journey C: Waybill Verification
1. Seller uploads waybill.
2. Backend extracts tracking via OCR and validates logistics status.
3. UI timeline advances to IN_TRANSIT with parsed tracking details.

### Journey D: Delivery And Dispute
1. Buyer confirms delivery or reports damage.
2. For damage, buyer uploads dispute evidence.
3. UI displays arbitration result when backend finishes AI adjudication.
4. If low confidence, UI clearly marks AWAITING_HUMAN_REVIEW.

### Journey E: Resolution And Wallet Release
1. Refund branch: show refund completion and closure details.
2. Release branch: show credited wallet balance and available wallet actions.

## 7) Frontend Information Architecture

Target route map:
- / (marketing + role entry)
- /auth/login
- /auth/signup
- /dashboard
- /escrow/new
- /escrow/[id]
- /wallet
- /wallet/send-money
- /wallet/cardless
- /wallet/vas

Suggested component domains:
- components/escrow
- components/wallet
- components/camera
- components/timeline
- components/feedback

## 8) API Surface Expectations (Frontend Consumes)

Expected backend route groups:
- /api/escrows
- /api/arbitration
- /api/wallet
- /api/uploads

Client requirements:
- Central typed API client with shared error handler.
- Correlation or idempotency key header on write requests.
- Retry strategy only for safe operations.
- User-friendly mapping for backend error codes.

## 9) Security And Reliability UX Requirements

- Prevent duplicate submits with disabled pending buttons.
- Display immutable transaction IDs in confirmation surfaces.
- Keep timeline audit entries visible and ordered.
- Do not infer financial state on client-only assumptions.
- Render backend-denied transition attempts as explicit warnings.

## 10) Hackathon Delivery Plan

### Phase 1: Core Escrow (Priority 1)
- Build auth and dashboard skeleton.
- Implement contract create, payment state, and escrow detail timeline.
- Implement baseline and dispute upload experiences.
- Implement arbitration and resolution status views.

Definition of done:
- Full happy path from create -> release can be demonstrated.
- Full dispute path to HITL can be demonstrated.
- No mocked frontend responses in demo mode.

### Phase 2: Business Wallet (Priority 2)
- Add send money flow UI.
- Add cardless cash-out paycode flow UI.
- Add VAS purchase flow UI.

Definition of done:
- Wallet actions are isolated from escrow core failures.
- Wallet views gracefully handle unavailable backend categories.

### Phase 3: Polish And Judging Readiness
- Add robust empty, loading, and failure states.
- Improve accessibility labels and keyboard interactions.
- Prepare demo script and fallback flows.

## 11) Demo Script (Judge Friendly)

Recommended 5-7 minute flow:
1. Create escrow and show translated contract.
2. Simulate buyer payment completion (sandbox).
3. Capture baseline and upload waybill.
4. Trigger dispute and show AI verdict payload.
5. Show both auto-resolve and human-review branches.
6. Show wallet credit and one post-sale wallet action.

## 12) Risks And Mitigations

- Backend latency for AI arbitration.
	- Mitigation: timeline polling with visible processing state.
- Payment webhook delay.
	- Mitigation: pending state with refresh and event timestamp.
- Duplicate action attempts.
	- Mitigation: optimistic lock UI + idempotency key strategy.
- API contract drift.
	- Mitigation: shared typed DTOs and strict runtime validation.

## 13) Environment Setup Notes

Required frontend environment variables:
- NEXT_PUBLIC_API_BASE_URL
- NEXT_PUBLIC_APP_ENV

Optional:
- NEXT_PUBLIC_SENTRY_DSN

## 14) Documentation Policy

When implementation decisions change:
- Update this file first.
- Update .github/copilot-instructions.md in the same pull request.
- Keep the escrow state model and transition rules synchronized across docs.

## 15) Linked Detailed Specs

Use these companion docs for execution:
- docs/implementation-backlog.md: ticket-level build plan with priorities and acceptance criteria.
- docs/api-contracts.md: frontend-backend payload and error contract expectations.
- docs/testing-and-demo-checklist.md: QA gates and judge demo runbook.
- docs/design-system.md: visual language and component-level design rules derived from interface references.
- docs/color-system.md: tokenized palette, semantic color mapping, and accessibility constraints.