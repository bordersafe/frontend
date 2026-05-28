# BorderSafe Frontend Docs (Hackathon Trajectory)

Source of truth: [new_docs/checklist.md](new_docs/checklist.md)

## Product Summary
BorderSafe is an inter-state escrow platform for B2B trade in Nigeria. It locks buyer funds, tracks delivery, and uses AI to reduce fraud and dispute time. This frontend focuses on a clean end-to-end flow that proves the full escrow lifecycle.

## Core User Journey and Screens
1) **Vendor creates escrow**
   - Form: buyer email, amount, description, optional store reference.
   - Submit to backend for a Squad payment link.
2) **Buyer pays**
   - Buyer completes payment off-platform via Squad link.
3) **Escrow tracking**
   - Vendor and buyer can see status updates.
4) **Delivery proof**
   - Buyer uploads delivery proof (image/PDF).
   - AI analysis runs and flags discrepancies.
5) **Admin review**
   - Admin dashboard shows AI summary and proof.
   - Admin finalizes payout or refund.

## Escrow Statuses (UI Mapping)
**Spec statuses**
- `AWAITING_PAYMENT`
- `FUNDS_LOCKED`
- `DELIVERED_AWAITING_BUYER_CONFIRMATION`
- `AWAITING_ADMIN_FINALIZATION`
- `DISBURSED` / `REFUNDED`

**Current backend status mapping**
- `AWAITING_PAYMENT` and `FUNDS_LOCKED` are implemented.
- `DELIVERED_AWAITING_BUYER_CONFIRMATION` is implemented via logistics webhook.
- `AWAITING_ADMIN_FINALIZATION` is the review state.
- `DISBURSED` and `REFUNDED` are terminal statuses.

## Frontend Architecture
- **Framework**: Next.js App Router
- **Styling**: Tailwind CSS
- **Auth**: Firebase Auth client SDK
- **API client**: `useAuthedApi()` for authenticated calls
- **State**: local component state + backend fetches per route

## Frontend-to-API Integration
**Current endpoints**
- `POST /api/squad/init` - create escrow + payment link
- `GET /api/escrow/:id` - fetch escrow details
- `POST /api/escrow/verify-waybill` - OCR extraction
- `POST /api/escrow/analyze` - AI advisory
- `POST /api/logistics/webhook` - delivery confirmation
- `POST /api/uploads/signature` - Cloudinary signed upload
- `GET /api/stores/mine` - list vendor stores

## Frontend Execution Checklist (Derived)
### Phase 1: Environment Setup
- [x] Next.js frontend created and running
- [x] Tailwind configured
- [x] Framer Motion installed
- [x] Cloudinary account connected
- [x] Firebase config added to `.env.local`
- [x] Firebase Auth login and signup pages wired

### Phase 2: Core Escrow Loop
- [x] Vendor form to create escrow
- [x] Submit to backend `/api/squad/init`
- [x] Receive payment link and display to vendor
- [ ] Buyer completes payment in test mode

#### Step 2: Webhook Payment Confirmation
- [x] Frontend updates UI state in real time after webhook

#### Step 3: Logistics Confirmation (Simulated)
- [x] Dev tool button to trigger delivery update
- [x] UI state for `DELIVERED_AWAITING_BUYER_CONFIRMATION`

#### Step 4: AI Advisory Engine
- [x] Buyer upload screen that stores proof in Cloudinary
- [x] AI advisory screen wired to `/api/escrow/analyze`

#### Step 5: Payout or Refund
- [x] Admin dashboard to approve payout/refund

### Phase 3: Human-in-the-Loop Admin Flow
- [x] Admin list view for unresolved escrows
- [x] Admin decision UI with AI summary and proof

### Phase 4: Launch Readiness
- [ ] UI polish for a smooth end-to-end walk-through
- [ ] Short flow script and validation run

### Phase 5: Hackathon Rubric Alignment
- [x] AI integration explained in UI
- [ ] Squad escrow flow visible in UI
- [x] Problem/impact clear in hero copy

## Scope Guardrails
- Keep the UI focused on the core escrow flow.
- No marketplace features.
- Prioritize one happy path.
