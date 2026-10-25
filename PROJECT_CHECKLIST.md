# Sheggar Wheels — Project Checklist & Implementation Tracker

## 1. Technology Stack & Foundations
- [x] Next.js App Router (TypeScript, React 18.3.1, Tailwind CSS) — *Verified in package.json & build*
- [x] LocalStorage (`sw_users_v1`, `sw_cars_v1`, `sw_bookings_v1`, `sw_reviews_v1`, `sw_disputes_v1`, `sw_announcements_v1`) — *Implemented in storage.ts*
- [x] SessionStorage (`sw_session_v1`, `sw_checkout_draft_v1`) — *Implemented in storage.ts*
- [x] Icons: Lucide React — *Integrated across all components*
- [x] Charts: Visual trend bars & screen-reader accessible tables — *Implemented in owner & admin*
- [x] Maps: Leaflet & React Leaflet (client-side only dynamic import with fallback) — *Implemented in LeafletMap.tsx*
- [x] Validation: Zod schemas & domain input rules — *Implemented in data.ts & forms*
- [x] Testing: Vitest & React Testing Library (12/12 passing) — *Executed and verified*
- [x] Seed Data: 9 realistic Addis Ababa cars, multiple owners, renter histories, reviews, disputes, admin — *Implemented in seedData.ts*

## 2. All Required Routes (App Router)
### Public Routes
- [x] `/` — Homepage (Hero search, featured approved cars, how-it-works, benefits, CTAs, footer)
- [x] `/cars` — Catalogue (Search, filters: neighborhood, price, seats, transmission; sorting, pagination, clear filters, map view)
- [x] `/cars/[id]` — Car Details (Gallery, specs, owner info, date selector, cost estimator, booking entry point, reviews)
- [x] `/signin` — Demo sign-in with 1-click credentials for Renter, Owner, Admin, Suspended; safe return URL handling
- [x] `/signup` — Registration (Renter only, unique email validation, demo disclaimer)

### Renter Routes
- [x] `/dashboard` — Renter Overview (Upcoming, past, spending summary, notifications, quick actions, CSV export)
- [x] `/bookings` — Renter Bookings (Filterable list, status badges, CSV export, search)
- [x] `/bookings/[id]` — Booking Details & Receipt (Pricing breakdown, status, cancellation action if eligible, print receipt)
- [x] `/bookings/[id]/track` — Simulated live vehicle tracking map with Leaflet + address fallback + transparent GPS disclosure
- [x] `/bookings/[id]/review` — Review submission for completed rentals (1-5 stars, comment, single submission rule)
- [x] `/checkout` — Checkout workflow (Session draft, fee calculation, simulated Telebirr/CBE payment, idempotency)

### Owner Routes
- [x] `/owner` — Owner Dashboard (Earnings, vehicle count, utilization charts, incoming requests with approve/decline)
- [x] `/owner/cars` — Owner Car Inventory (Status badges: approved/pending/rejected, edit/availability links)
- [x] `/owner/cars/new` — Create Car Listing (Validation, Addis Ababa neighborhoods, moderation queue submission)
- [x] `/owner/cars/[id]/edit` — Edit Car Listing (Ownership guard, validation, re-moderation)
- [x] `/owner/cars/[id]/availability` — Manage blocked/unavailable calendar dates
- [x] `/owner/cars/[id]/bookings` — Bookings specific to this vehicle
- [x] `/owner/earnings` — Earnings breakdown, 90% net payout calculation, per-vehicle revenue, CSV export
- [x] `/owner/reviews` — Reviews on owner cars + Owner reply form and history
- [x] `/owner/disputes` — Disputes involving owner bookings + response view

### Admin Routes
- [x] `/admin` — Admin Overview (Platform metrics, booking volumes, commission stats, chart & table)
- [x] `/admin/listings` — Car Moderation (Approve/Reject pending listings with notes, exclude from public search)
- [x] `/admin/users` — User Directory (List, search, filter by role)
- [x] `/admin/users/[id]` — User Detail & Moderation (Suspend/Reinstate account, vehicle & booking history)
- [x] `/admin/bookings` — All Platform Bookings (Filter by status, inspect details, CSV export)
- [x] `/admin/disputes` — Dispute Management (List all disputes, status filters)
- [x] `/admin/disputes/[id]` — Resolve Dispute (Administrator resolution notes, timestamp, state transition)
- [x] `/admin/reports` — Platform Analytics, Commission revenue, 3 CSV exports (Financial ledger, User census, Dispute ledger)
- [x] `/admin/announcements` — System Announcements (Create, toggle active, displayed to users in notification bell)

### Special / Layout Routes
- [x] `not-found.tsx` (Custom 404 page)
- [x] `loading.tsx` (Global suspense loading boundary)
- [x] `error.tsx` (Global error boundary with retry)
- [x] Root Layout with navigation, demo banner, global notifications, responsive footer
- [x] `sitemap.ts` & `robots.ts`

## 3. Core Domain & Booking State Machine
- [x] Domain Models: User, Car, Booking, Review, Dispute, Announcement (`src/types/index.ts`)
- [x] State Transitions:
  - `requested` -> `confirmed`, `declined`, `cancelled`
  - `confirmed` -> `in_progress`, `cancelled`
  - `in_progress` -> `completed`, `disputed`
  - `completed` -> reviewable
  - `disputed` -> `resolved` (admin only)
- [x] Availability re-check before confirmation preventing double bookings
- [x] Invalidation of external return URLs (prevent open redirect)
- [x] Protection checks inside domain mutation layer

## 4. Nine Negative Tests (Vitest automated & passing)
- [x] 1. A signed-out user cannot create a booking — *PASSED*
- [x] 2. A renter cannot cancel another renter's booking — *PASSED*
- [x] 3. An unsafe external redirect is rejected — *PASSED*
- [x] 4. An owner cannot edit another owner's car — *PASSED*
- [x] 5. A renter cannot access another renter's booking — *PASSED*
- [x] 6. A suspended account cannot perform protected actions — *PASSED*
- [x] 7. Public registration cannot grant administrator privileges — *PASSED*
- [x] 8. Invalid booking transitions are rejected without changing data — *PASSED*
- [x] 9. Overlapping active bookings cannot both be confirmed — *PASSED*

## 5. Documentation
- [x] `README.md`
- [x] `STRATEGY.md`
- [x] `BOUNDARY.md`
- [x] `AUTH.md`
- [x] `DATA.md`
- [x] `PERF.md`
- [x] `FUTURE.md`
- [x] `PROJECT_CHECKLIST.md` (this file)
- [x] `.env.example`
- [x] `.gitignore`
