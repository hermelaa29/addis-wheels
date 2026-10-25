# Sheggar Wheels — Codebase Walkthrough & File-by-File Guide (CODEBASE_GUIDE.md)

This document provides an exhaustive, file-by-file explanation of every single source file in the Sheggar Wheels application, explaining **what each file does**, **why it exists**, **how it connects to other parts of the system**, and **the specific libraries and language features used**.

---

## 1. Directory Structure Overview

```
sheger-wheels/
├── src/
│   ├── app/                    # Next.js App Router pages, layouts, and API routes
│   │   ├── admin/              # Administrator portal routes (9 pages)
│   │   ├── bookings/           # Renter booking routes (4 pages)
│   │   ├── cars/               # Fleet catalogue & car details (2 pages)
│   │   ├── checkout/           # Checkout workflow page
│   │   ├── dashboard/          # Renter overview page
│   │   ├── owner/              # Host / vehicle owner routes (9 pages)
│   │   ├── signin/             # Demo sign-in with 1-click personas
│   │   ├── signup/             # Renter registration page
│   │   ├── layout.tsx          # Master layout with Navbar, Footer, and DemoBanner
│   │   ├── page.tsx            # Homepage with Hero search and featured fleet
│   │   ├── globals.css         # Tailwind & Leaflet global stylesheet
│   │   ├── not-found.tsx       # Custom 404 page
│   │   ├── loading.tsx         # Global suspense loading fallback
│   │   ├── error.tsx           # Global error boundary with retry action
│   │   ├── robots.ts           # Crawler directives (blocks private dashboards)
│   │   └── sitemap.ts          # XML sitemap generator for public fleet URLs
│   ├── components/             # Reusable UI components
│   │   ├── Badge.tsx           # Accessible status tags (active, pending, etc.)
│   │   ├── Breadcrumbs.tsx     # Navigation hierarchy trail
│   │   ├── CarCard.tsx         # Luxury vehicle display card
│   │   ├── DemoBanner.tsx      # Top prototype disclaimer with reset seed button
│   │   ├── Footer.tsx          # Responsive site footer with Addis Ababa hubs
│   │   ├── LeafletMap.tsx      # Client-side dynamic Leaflet interactive map
│   │   ├── Navbar.tsx          # Sticky glassmorphism header & persona switcher
│   │   ├── NotificationBell.tsx# Activity feed derived from local demo state
│   │   ├── RoleGuard.tsx       # Route authorization gatekeeper (client-side)
│   │   └── ToastContainer.tsx  # Global notification toast renderer (Zustand)
│   ├── lib/                    # Domain logic & storage layer
│   │   ├── cookies.ts          # Cookie sync for Next.js Edge Middleware
│   │   ├── data.ts             # Domain mutations, state machine, CSV generators
│   │   ├── seedData.ts         # Realistic Addis Ababa initial dataset
│   │   ├── storage.ts          # Resilient localStorage/sessionStorage helpers
│   │   ├── store.ts            # Zustand stores (useAuthStore, useFilterStore, useToastStore)
│   │   ├── useStorage.ts       # React reactive storage & session hooks
│   │   ├── useSWRData.ts       # SWR caching, polling intervals, and debouncing
│   │   └── validations.ts      # Comprehensive Zod validation schemas
│   ├── middleware.ts           # Next.js Edge Proxy Middleware & Server-Side Route Guard
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces & domain enums
│   └── __tests__/
│       └── domain.test.ts      # Automated Vitest unit & negative security tests
├── package.json                # Project dependencies & npm scripts
├── tsconfig.json               # TypeScript compiler configuration & path aliases
├── tailwind.config.ts          # Tailwind CSS theme & custom color palette
├── vitest.config.ts            # Automated test runner configuration with jsdom
├── .eslintrc.json              # ESLint linting configuration
├── .env.example                # Environment variable documentation
└── README.md                   # Project overview & quickstart
```

---

## 2. Configuration Files

### `package.json`
- **Purpose**: Defines project metadata, build scripts, and dependencies.
- **Key Scripts**:
  - `npm run dev`: Starts local development server on port 3000/3001.
  - `npm run build`: Executes Next.js production build (`next build`).
  - `npm test`: Runs the Vitest test suite (`vitest run`).
  - `npm run lint`: Runs ESLint code quality checks (`next lint`).
- **Dependencies Used**:
  - `next`: App Router framework.
  - `react`, `react-dom`: UI component library.
  - `lucide-react`: Lightweight, accessible SVG icons.
  - `leaflet`, `react-leaflet`: Client-side interactive mapping.
  - `recharts`: Charting and data visualization.
  - `zod`: Schema input validation.
  - `tailwindcss`, `postcss`: Modern utility-first CSS styling.
  - `vitest`, `jsdom`, `@testing-library/react`: Automated unit and browser-simulation testing.

### `tsconfig.json`
- **Purpose**: Configures the TypeScript compiler.
- **Key Features**: Enables strict mode (`"strict": true`), ESNext modules, and the `@/*` path alias mapping to `./src/*`, allowing clean imports like `import { getCars } from "@/lib/data"`.

### `tailwind.config.ts`
- **Purpose**: Extends Tailwind CSS with the Sheggar Wheels design system.
- **Key Features**: Defines the custom `navy` color palette (`navy-50` through `navy-950`), emerald accents (`#059669`), and includes all source paths in `content: [...]` for minimal production CSS output.

### `vitest.config.ts`
- **Purpose**: Configures the Vitest automated test runner.
- **Key Features**: Sets the environment to `jsdom` (simulating `window.localStorage` and `window.sessionStorage` in Node.js) and configures the `@/*` alias for test imports.

### `.eslintrc.json`
- **Purpose**: ESLint configuration extending `next/core-web-vitals` to guarantee clean code and catch syntax bugs.

### `.env.example`
- **Purpose**: Documents the environment variables used by the application (`NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_DEFAULT_CURRENCY`, etc.) with safe dummy values.

---

## 3. Data & Domain Layer (`src/lib/` and `src/types/`)

### `src/types/index.ts`
- **Purpose**: Single source of truth for TypeScript types across the entire codebase.
- **Key Types Defined**:
  - `User`, `UserRole` (`renter | owner | admin`), `UserStatus` (`active | suspended`).
  - `Car`, `CarTransmission` (`automatic | manual`), `CarStatus` (`approved | pending | rejected | inactive`).
  - `Booking`, `BookingStatus` (`requested | confirmed | declined | cancelled | in_progress | completed | disputed`).
  - `PaymentStatus` (`simulated_paid | pending | refunded`).
  - `Review`: Rating (1–5), comment, optional `ownerReply`.
  - `Dispute`, `DisputeStatus` (`open | under_review | resolved`).
  - `Announcement`: Title, message, active flag.
  - `SessionData`: The currently signed-in user and their active role mode.
  - `CheckoutDraft`: The in-progress booking selection stored in `sessionStorage`.
  - `PlatformMetrics`: Aggregated statistics for the administrator dashboard.

### `src/lib/seedData.ts`
- **Purpose**: Provides realistic fictional initial data representing Addis Ababa.
- **Content**:
  - **6 Users**: Standard renter Abebe, host Dawit with 4 cars, host Bethlehem with 4 cars, admin Almaz, and suspended account Yohannes.
  - **9 Cars**: Varied makes/models (Toyota Rav4, Hyundai Tucson, Land Cruiser Prado, Suzuki Dzire, Mercedes-Benz C200, HiAce Van, Ford Ranger, Kia Sportage, BYD Atto 3 EV) across Addis Ababa neighbourhoods (Bole, Kazanchis, Piassa, Sarbet, CMC, Old Airport, Mexico). Includes realistic coordinates, daily prices in ETB, and Unsplash photos.
  - **Bookings, Reviews, Disputes & Announcements**: Seeded historical records representing every stage of the booking lifecycle.

### `src/lib/storage.ts`
- **Purpose**: Low-level browser storage driver with error handling and reactive event dispatching.
- **Key Functions**:
  - `readStorage<T>(key, isSession, fallback)`: Safely reads and parses JSON from `localStorage` or `sessionStorage`. Catches corrupted JSON without crashing the app.
  - `writeStorage<T>(key, value, isSession)`: Serializes and saves data. Dispatches a custom window event `sw_storage_update` to notify other components to re-render immediately. Handles storage quota errors.
  - `initializeDemoData(force)`: Checks if storage is empty on first app load and seeds it with `seedData.ts`.
  - `resetDemoData()`: Overwrites storage with clean initial seed data (triggered by "Reset Seed" in DemoBanner).
  - `getCurrentSession()`, `saveSession()`, `clearSession()`: Manages `sessionStorage` session state.
  - `getCheckoutDraft()`, `saveCheckoutDraft()`, `clearCheckoutDraft()`: Manages temporary booking drafts.

### `src/lib/data.ts`
- **Purpose**: Core domain layer containing business logic, authorization guards, and state machine transitions.
- **Key Features & Functions**:
  - `safeReturnPath(path, fallback)`: Security guard against Open Redirect attacks. Rejects protocol-relative URLs (`//evil.com`), external protocols (`https:`, `javascript:`), and malformed paths.
  - `signInAsDemo(userId, role)`: Sets active session for testing. Blocks suspended accounts.
  - `registerRenter(data)`: Validates name, unique email, and phone. Enforces security rule that public registration **only creates Renter accounts** (never owner or admin).
  - `getCars(filters)`: Queries vehicles by search text, neighbourhood, price range, transmission, seats, and moderation status.
  - `saveCar(carData)`: Creates new vehicle (with `pending` status for admin moderation) or edits existing car (strictly enforces that hosts can only edit their own vehicles).
  - `moderateCar(carId, newStatus)`: Admin-only function to approve or reject vehicle listings.
  - `updateCarAvailability(carId, dates)`: Host function to block/unblock calendar dates.
  - `calculateDays(start, end)`: Calculates rental duration.
  - `isDateRangeAvailable(carId, start, end)`: Re-checks that dates are not blocked by the host and do not overlap with any active `confirmed` or `in_progress` booking.
  - `createBooking(data)`: Validates active session, non-suspended account, future dates, calculates subtotal, 10% platform fee, and total ETB, and saves booking with status `requested`.
  - `transitionBooking(bookingId, targetStatus, options)`: **The Core State Machine**. Validates actor permissions (e.g., only owner can approve/decline; only renter can cancel requested bookings; only admin can resolve disputes). Re-validates calendar conflicts before confirming to prevent double-booking.
  - `createReview(data)`: Validates that trip is `completed`, the reviewer is the booking's renter, and prevents duplicate reviews.
  - `replyToReview(reviewId, reply)`: Allows the car owner to submit an official response.
  - `createDispute(data)`: Files a claim on an ongoing or completed rental.
  - `resolveDispute(disputeId, notes)`: Admin-only function recording resolution notes and timestamps.
  - `escapeCsvCell(val)` & `generateCsv(data, headers)`: RFC 4180 compliant CSV generator handling commas, quotes, and newlines.
  - `downloadCsv(content, filename)`: Triggers browser file download using `URL.createObjectURL(new Blob(...))`.

### `src/lib/useStorage.ts`
- **Purpose**: React custom hooks connecting React components to browser storage without hydration errors.
- **Key Hooks**:
  - `useIsMounted()`: Returns `false` on initial server render and `true` once mounted on the client. Guarantees browser storage is never accessed during server pre-rendering.
  - `useSession()`: Provides current session and automatically re-renders when the user signs in, switches personas, or signs out.
  - `useLiveStorage<T>(key)`: Subscribes to the `sw_storage_update` window event and cross-tab storage events, keeping component state synchronized in real-time.

### `src/lib/store.ts` (Zustand Global State Management)
- **Purpose**: High-performance, lightweight Zustand stores managing global state without prop-drilling.
- **Key Stores**:
  - `useAuthStore`: Manages authenticated session (`SessionData`), active persona role, login/logout actions, and synchronizes session state into both `sessionStorage` and browser cookies (`sw_session`) for Next.js Edge Middleware access.
  - `useFilterStore`: Manages car catalogue filters (make, model, price range, transmission, seats, sorting, pagination, and debounced text search).
  - `useToastStore`: Global notification toast queue with auto-dismiss timers and severity levels (`success`, `error`, `warning`, `info`).

### `src/lib/useSWRData.ts` (SWR Caching, Polling & Debouncing)
- **Purpose**: Client-side data fetching and revalidation engine powered by Vercel SWR.
- **Key Hooks**:
  - `useCarsSWR()`: Caches the vehicle fleet in memory with key-based deduplication and revalidates on window focus and storage change events.
  - `useCarByIdSWR(id)`: Cached single car fetcher.
  - `useBookingsSWR({ pollInterval })`: Caches booking history with configurable polling intervals.
  - `useLiveTelemetrySWR(bookingId)`: Implements **live telemetry polling** every 3.5 seconds (`refreshInterval: 3500`), updating simulated vehicle GPS coordinates, speed (km/h), fuel/battery level, and waypoint pings for the tracking page.
  - `useDebounce<T>(value, delayMs)`: Custom hook delaying filter queries until user stops typing, preventing UI stutter and unnecessary re-renders.

### `src/lib/validations.ts` (Zod Schema Validation)
- **Purpose**: Centralized type-safe validation schemas using Zod for all application inputs, forms, and date intervals.
- **Key Schemas**:
  - `SignInSchema`: Validates email formats and presence.
  - `SignUpSchema`: Enforces legal name length, email uniqueness, and valid Ethiopian phone numbers (`+2519...` or `09...`).
  - `CarListingSchema`: Validates vehicle specifications, production year (1995 to present+1), realistic daily rates (500 to 50,000 ETB), seat count, transmission, and minimum 20-character description.
  - `BookingDatesSchema`: Validates rental date ranges, past date prevention, and start/end order.
  - `ReviewSchema`: Validates 1 to 5 star ratings and minimum 10-character feedback.
  - `DisputeSchema` & `AnnouncementSchema`: Strict length and content validation.

### `src/lib/cookies.ts`
- **Purpose**: Client-side cookie helpers (`setSessionCookie`, `clearSessionCookie`, `getSessionCookie`) that synchronize the active demo user session into browser cookies so Next.js Edge Middleware can inspect it on incoming HTTP requests.

### `src/middleware.ts` (Next.js Edge Proxy & Server-Side Protection)
- **Purpose**: Edge middleware running before server-side routing to enforce security headers and route access control.
- **Key Features**:
  - **Server-Side Protection**: Inspects `sw_session` cookie; redirects unauthenticated visitors from `/dashboard`, `/bookings`, `/checkout`, `/owner/*`, and `/admin/*` to `/signin?returnUrl=...`.
  - **Role-Based Server Gatekeeping**: Restricts `/owner/*` to hosts/admins and `/admin/*` to administrators.
  - **Account Status Enforcement**: Immediately blocks suspended accounts at the server level.
  - **Security Proxy & Headers**: Injects `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and handles mock proxying on `/api/proxy/*`.

---

## 4. Reusable UI Components (`src/components/`)

### `src/components/Navbar.tsx`
- **Purpose**: Sticky header navigation bar with glassmorphism styling (`backdrop-blur-md`).
- **Features**: Brand logo with Ethiopian theme, responsive navigation links, 1-click persona switcher dropdown (Abebe, Dawit, Almaz), notification bell, and mobile hamburger drawer.

### `src/components/Footer.tsx`
- **Purpose**: Responsive site footer.
- **Features**: Explains platform mission, lists Addis Ababa neighbourhood hubs (Bole, Kazanchis, etc.), provides direct links to Renter, Host, and Admin portals, and includes clear demo disclaimers.

### `src/components/DemoBanner.tsx`
- **Purpose**: Slim top banner at the very top of the screen.
- **Features**: Discloses that the app is an interactive prototype running on browser storage, provides an instant "Reset Seed" button, and can be dismissed.

### `src/components/CarCard.tsx`
- **Purpose**: Luxury vehicle display card used on the homepage, catalogue, and host listings.
- **Features**: High-definition image with smooth zoom hover effect, dark gradient vignette, floating price tag in glassmorphism (`4,500 ETB/day`), quick-spec badges (transmission, seats, verified host), and direct link to vehicle details.

### `src/components/LeafletMap.tsx`
- **Purpose**: Interactive map showing Addis Ababa locations and vehicle waypoints.
- **Features**: Dynamically imports Leaflet only in the browser (preventing SSR crashes), renders custom SVG car markers, displays popups with vehicle rates, and draws route polylines. Includes a clean textual address fallback if tiles fail to load.

### `src/components/RoleGuard.tsx`
- **Purpose**: Client-side route protection gatekeeper.
- **Features**: Wraps protected pages (`/dashboard`, `/owner/**`, `/admin/**`). Checks for active session, checks account suspension status, and verifies role permissions. Renders clean access-denied screens with links to sign in.

### `src/components/Badge.tsx`
- **Purpose**: Accessible status indicator pill.
- **Features**: Formats statuses (`approved`, `confirmed`, `in_progress`, `completed`, `cancelled`, `disputed`) with distinct accessible color themes (emerald, amber, rose, sky) and an accessible inner dot.

### `src/components/Breadcrumbs.tsx`
- **Purpose**: Accessible navigational hierarchy breadcrumb trail with home icon and Chevron separators.

### `src/components/NotificationBell.tsx`
- **Purpose**: Notification bell dropdown in the navbar.
- **Features**: Dynamically derives alerts directly from application state (e.g. host sees pending booking requests; renter sees booking approvals; admin sees open disputes; all users see broadcast announcements).

---

## 5. Application Pages & Routes (`src/app/`)

### Global Files
- **`src/app/layout.tsx`**: Master root layout wrapping all pages in `<DemoBanner />`, `<Navbar />`, `<main>`, and `<Footer />`. Injects global metadata, title templates, and OpenGraph tags.
- **`src/app/globals.css`**: Tailwind base styles, Leaflet CSS import, custom slim scrollbars, accessible focus outlines, and glassmorphism utility classes.
- **`src/app/not-found.tsx`**: Custom 404 page with recovery navigation back to Home or Fleet.
- **`src/app/loading.tsx`**: Global suspense loading spinner.
- **`src/app/error.tsx`**: Error boundary with a "Try Again" recovery action.
- **`src/app/robots.ts`**: Search engine crawler configuration disallowing private dashboard routes.
- **`src/app/sitemap.ts`**: XML sitemap generator indexing public pages and seeded car detail URLs.

### Public Routes
- **`src/app/page.tsx` (`/`)**: Homepage featuring a dark luxury hero section with ambient lighting, floating unified search pill bar (neighbourhood + date range), quick category chips (SUVs, Sedans, Bole), featured vehicle grid, "How It Works" dual guides for renters and hosts, trust guarantees, and call-to-action banners.
- **`src/app/cars/page.tsx` (`/cars`)**: Full fleet catalogue. Features keyword search, neighbourhood filters, gearbox selector, passenger capacity filter, price range inputs, sorting options, pagination, and a toggle between Grid View and interactive Leaflet Map View.
- **`src/app/cars/[id]/page.tsx` (`/cars/[id]`)**: Vehicle details page. Renders photo showcase with thumbnail row, specs grid, host profile, verified renter reviews with host replies, neighbourhood pickup map, live rental price estimator (calculating subtotal + 10% fee), date conflict validator, and entry point to checkout.
- **`src/app/signin/page.tsx` (`/signin`)**: 1-click persona selector. Lets reviewers test Renter (Abebe), Host (Dawit), Admin (Almaz), and Suspended (Yohannes) with a single click. Validates `returnUrl` against open-redirect vulnerabilities.
- **`src/app/signup/page.tsx` (`/signup`)**: Renter registration form validating name, email uniqueness, and Ethiopian phone number. Enforces that self-registration never grants admin or host permissions.

### Renter Routes
- **`src/app/checkout/page.tsx` (`/checkout`)**: Final reservation step. Reads draft from `sessionStorage`, displays car summary, rental dates, itemized fees, lets the user choose between Telebirr / CBE Birr / Demo Card, simulates transaction reference, and creates booking.
- **`src/app/dashboard/page.tsx` (`/dashboard`)**: Renter command center. Displays total trips, pending trips, completed trips, total spending in ETB, active ongoing rental alert banner, recent bookings list, eligible cancellation action, and CSV export.
- **`src/app/bookings/page.tsx` (`/bookings`)**: Comprehensive booking history. Searchable, filterable by status (`all`, `requested`, `confirmed`, `in_progress`, `completed`, `cancelled`, `disputed`), with direct links to receipts, live tracking, and review forms.
- **`src/app/bookings/[id]/page.tsx` (`/bookings/[id]`)**: Official booking receipt. Itemized daily rate × days + 10% fee breakdown, host contact details, print receipt button, cancellation action, and dispute filing modal.
- **`src/app/bookings/[id]/track/page.tsx` (`/bookings/[id]/track`)**: Interactive Leaflet route tracking map showing simulated waypoints across Addis Ababa (Bole Medhanialem &rarr; Meskel Square &rarr; Kazanchis UNECA &rarr; Arat Kilo) with transparent simulation disclosures.
- **`src/app/bookings/[id]/review/page.tsx` (`/bookings/[id]/review`)**: Verified feedback form for completed rentals. Features 1–5 star rating selector, detailed feedback textarea, and duplicate review prevention.

### Host / Owner Routes
- **`src/app/owner/page.tsx` (`/owner`)**: Host dashboard overview. Displays fleet count, pending requests needing attention, net host earnings (90%), vehicle utilization rate, monthly revenue visual bar trend, and an accessible data table alternative. Includes immediate "Approve" and "Decline" decision buttons with conflict detection.
- **`src/app/owner/cars/page.tsx` (`/owner/cars`)**: Fleet management page listing only the vehicles owned by the active host, with status badges (`approved`, `pending`, `rejected`), blocked date indicators, and links to edit or view vehicle bookings.
- **`src/app/owner/cars/new/page.tsx` (`/owner/cars/new`)**: New vehicle listing form with input validation, neighbourhood coordinate mapping, photo URLs, and automatic submission into the admin moderation queue.
- **`src/app/owner/cars/[id]/edit/page.tsx` (`/owner/cars/[id]/edit`)**: Edit car listing form with strict ownership validation (hosts cannot edit other hosts' cars).
- **`src/app/owner/cars/[id]/availability/page.tsx` (`/owner/cars/[id]/availability`)**: Calendar date blocker allowing hosts to add and remove unavailable dates for personal use or maintenance.
- **`src/app/owner/cars/[id]/bookings/page.tsx` (`/owner/cars/[id]/bookings`)**: Audit table showing all bookings and decision requests specific to a single host vehicle.
- **`src/app/owner/earnings/page.tsx` (`/owner/earnings`)**: Host financial summary detailing gross fares, 10% platform fees, and 90% net host payouts, with per-vehicle revenue breakdown and CSV download.
- **`src/app/owner/reviews/page.tsx` (`/owner/reviews`)**: Host review management page displaying renter ratings on the host's fleet with an interactive reply form.
- **`src/app/owner/disputes/page.tsx` (`/owner/disputes`)**: Host dispute center showing claims filed on the host's vehicles and administrator adjudication findings.

### Administrator Routes
- **`src/app/admin/page.tsx` (`/admin`)**: Executive platform console displaying KPI metrics (total users, active fleet, platform commission, open claims), priority moderation alerts, booking volume trends, and accessible tables.
- **`src/app/admin/listings/page.tsx` (`/admin/listings`)**: Listing moderation queue where administrators review, approve, or reject newly listed vehicles. Ensures rejected and pending cars do not appear in public search.
- **`src/app/admin/users/page.tsx` (`/admin/users`)**: Master user directory with role filtering, search, and instant account suspension/reinstatement buttons.
- **`src/app/admin/users/[id]/page.tsx` (`/admin/users/[id]`)**: Deep user profile inspection showing contact info, joined date, hosted vehicle fleet, and renter booking history.
- **`src/app/admin/bookings/page.tsx` (`/admin/bookings`)**: Master platform booking audit table showing every reservation across Addis Ababa with status filters and CSV export.
- **`src/app/admin/disputes/page.tsx` (`/admin/disputes`)**: Dispute tribunal list showing open claims and resolved cases.
- **`src/app/admin/disputes/[id]/page.tsx` (`/admin/disputes/[id]`)**: Adjudication screen where administrators review renter and host statements, record binding resolution findings, and seal the claim with admin ID and timestamp.
- **`src/app/admin/reports/page.tsx` (`/admin/reports`)**: Executive intelligence hub providing 3 downloadable RFC 4180 CSV ledgers: Financial & Commission Ledger, User Census, and Disputes Audit.
- **`src/app/admin/announcements/page.tsx` (`/admin/announcements`)**: System announcement manager allowing administrators to publish, edit, and toggle platform-wide announcements.

---

## 6. Automated Tests (`src/__tests__/domain.test.ts`)

- **Purpose**: Automated test suite executed with Vitest and jsdom.
- **Test Cases Covered**:
  1. *Negative Test 1*: Signed-out user cannot create a booking.
  2. *Negative Test 2*: Renter cannot cancel another renter's booking.
  3. *Negative Test 3*: Unsafe external redirects (`https://evil.com`, `//evil.com`, `javascript:...`) are rejected by `safeReturnPath`.
  4. *Negative Test 4*: Host cannot edit another host's car.
  5. *Negative Test 5*: Renter booking queries strictly isolate records by authenticated user ID.
  6. *Negative Test 6*: Suspended accounts cannot sign in or mutate records.
  7. *Negative Test 7*: Public registration cannot escalate privileges to admin or owner.
  8. *Negative Test 8*: Invalid state transitions (e.g. confirming a completed booking) are rejected without data corruption.
  9. *Negative Test 9*: Overlapping active bookings cannot both be confirmed (conflict detection).
  10. *CSV Escaping Test*: Verifies RFC 4180 escaping of commas, quotation marks, and line breaks.
  11. *Review Eligibility Test*: Enforces that only completed trips can be reviewed and only once.
  12. *Corrupted Storage Recovery Test*: Verifies that malformed JSON in `localStorage` does not crash the application.
