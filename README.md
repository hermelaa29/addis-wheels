# Sheggar Wheels (ሸገር ዊልስ) — Peer-to-Peer Car Rental Marketplace

**Sheggar Wheels** is a peer-to-peer car sharing and rental platform built for Addis Ababa, Ethiopia. It connects local vehicle hosts across major sub-cities (Bole, Kazanchis, Piassa, Sarbet, CMC, Old Airport, Megenagna, and Mexico Square) with verified drivers seeking flexible, transparent, and direct car rentals.

This frontend capstone application runs entirely on the **Next.js App Router** with browser-persisted state (`localStorage` and `sessionStorage`), responsive mobile-first Tailwind CSS styling, simulated telematics and route tracking via Leaflet, and a formal domain state machine.

---

## 🚗 Core Features

### 1. Public Portal
- **Landing Page (`/`)**: Hero search with real-time location and date pickers, featured Addis Ababa vehicles, "How it Works" guide for both renters and hosts, trust guarantees, and clear platform benefits.
- **Car Catalogue (`/cars`)**: Full searchable fleet with multi-criteria filtering by neighbourhood, transmission (automatic/manual), passenger seats, price range in Ethiopian Birr (ETB), sorting options (price asc/desc, newest, seats), pagination, view toggle (Grid / Interactive Leaflet Map), and URL query sync.
- **Car Details (`/cars/[id]`)**: High-resolution gallery, comprehensive specs, host profile, verified renter reviews, real-time rental cost estimator (daily rate × days + 10% platform fee), and interactive neighbourhood pickup map.

### 2. Authentication & Access Control
- **1-Click Demo Persona Sign-In (`/signin`)**: Rapid identity switching between:
  - **Abebe Kebede** (`renter@shegerwheels.com`) — Standard Renter
  - **Dawit Haile** (`owner@shegerwheels.com`) — Host with 4 vehicles
  - **Almaz Worku** (`admin@shegerwheels.com`) — Platform Administrator
  - **Yohannes Berhanu** (`suspended@shegerwheels.com`) — Suspended Account for testing
- **Self-Registration (`/signup`)**: Validates name, unique email, Ethiopian phone number (`+251`). Strict rule: public self-registration only grants Renter privileges, preventing unauthorized administrative escalation.
- **Safe Return Path Validation**: Reject external, protocol-relative, and javascript URI redirects (`safeReturnPath`).

### 3. End-to-End Booking & Checkout Workflow
- **Checkout (`/checkout`)**: Reviews temporary draft saved in `sessionStorage` (`sw_checkout_draft_v1`), itemized fee calculations (10% platform fee), simulated Telebirr / CBE Birr / Demo Card payment options, idempotency protection against double clicks, and immediate receipt generation.
- **Trip Receipt (`/bookings/[id]`)**: Full itemized receipt with unique transaction reference, print button, host phone and contact info, cancellation controls, dispute triggers, and review entry points.
- **Live GPS Simulation (`/bookings/[id]/track`)**: Interactive Leaflet map displaying vehicle route corridors across Addis Ababa landmarks (Bole Medhanialem &rarr; Meskel Square &rarr; Kazanchis UNECA &rarr; Arat Kilo) with transparent simulation disclosures.

### 4. Vehicle Host Hub (`/owner`)
- **Host Dashboard (`/owner`)**: Metrics on active listings, pending moderation items, incoming requests, net payouts (90% to host), fleet utilization rates, and monthly revenue trends.
- **Fleet Inventory (`/owner/cars`)**: Manage vehicles, inspect status (`approved`, `pending`, `rejected`), with direct links to edit, manage availability, or view car-specific booking history.
- **New Listing Creation (`/owner/cars/new`)**: Full form with validation, neighbourhood coordinate mapping, photo URLs, and automatic submission to admin moderation.
- **Calendar Availability (`/owner/cars/[id]/availability`)**: Block specific dates for host personal use or maintenance.
- **Host Earnings & CSV Export (`/owner/earnings`)**: Itemized per-vehicle earnings table and instant RFC 4180 compliant CSV export.
- **Guest Reviews & Host Replies (`/owner/reviews`)**: View renter feedback and publish direct host replies.
- **Host Dispute Center (`/owner/disputes`)**: Track ongoing renter claims.

### 5. Administrator Governance Console (`/admin`)
- **Executive Overview (`/admin`)**: Total platform metrics, commission revenue tracking (10%), user counts (active vs. suspended), and moderation alerts.
- **Listing Moderation (`/admin/listings`)**: Approve or reject newly submitted or edited vehicles. Rejected/pending vehicles are excluded from public search.
- **User Directory & Account Controls (`/admin/users`, `/admin/users/[id]`)**: Search, inspect profiles, audit user vehicle fleets and booking histories, and suspend or reinstate accounts. Suspended accounts are immediately blocked from mutating data.
- **Platform Bookings (`/admin/bookings`)**: Comprehensive audit of all platform reservations with search, filtering, and receipt links.
- **Dispute Tribunal (`/admin/disputes`, `/admin/disputes/[id]`)**: Adjudicate disputes, record binding administrative findings, and archive with administrator timestamps.
- **Reports & Data Exports (`/admin/reports`)**: Download Financial Ledgers, User Censuses, and Disputes Audits as CSVs.
- **System Announcements (`/admin/announcements`)**: Create and broadcast real-time announcements to the community notification bell.

---

## 🛠️ Technology Stack

| Layer | Tool / Library | Version | Notes |
|---|---|---|---|
| Framework | **Next.js (App Router)** | 14.2.35 | Server Components + Client Boundaries |
| UI Library | **React** | 18.3.1 | Core component tree |
| Styling | **Tailwind CSS** | 3.4.14 | Modern car marketplace navy & emerald theme |
| Icons | **Lucide React** | 0.460.0 | Accessible SVG iconography |
| Data Validation | **Zod** | 3.23.8 | Schema validation |
| Interactive Maps | **Leaflet & React Leaflet** | 1.9.4 / 4.2.1 | Client-side dynamic import with fallback |
| Testing | **Vitest & React Testing Library** | 2.1.4 | Automated domain & negative security testing |
| Local Persistence | **Browser Storage** | LocalStorage / SessionStorage | Custom reactive event broadcast hook |

---

## 📦 Installation & Local Setup

```bash
# 1. Clone or navigate to the repository directory
cd sheger-wheels

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Open in browser
# http://localhost:3000
```

### Production Build & Test Scripts
```bash
# Run automated Vitest unit & negative tests
npm test

# Run ESLint validation
npm run lint

# Build optimized production bundle
npm run build

# Start production server
npm start
```

---

## 🔑 Demo Accounts & Testing Identities

You can test any role instantly using the 1-click persona buttons on the `/signin` page or the top navigation bar:

| Role | Name | Email | Persona Capabilities |
|---|---|---|---|
| **Renter** | Abebe Kebede | `renter@shegerwheels.com` | Active & completed bookings, review submission, route tracking |
| **Host / Owner** | Dawit Haile | `owner@shegerwheels.com` | 4 listed cars, incoming booking approval, earnings, review replies |
| **Administrator** | Almaz Worku | `admin@shegerwheels.com` | Listing moderation, account suspension, dispute arbitration, reports |
| **Suspended Account** | Yohannes Berhanu | `suspended@shegerwheels.com` | Tests negative security enforcement (cannot book or edit) |

---

## 🛡️ Booking State Machine

```
[Requested]  ──(Host Approves)──>  [Confirmed]  ──(Start Trip)──>  [In Progress]  ──(Return Car)──>  [Completed] ──> [Reviewable]
     │                                 │                                │
     ├──(Host Declines)──> [Declined]  └──(Cancel)──────> [Cancelled]   └──(Claim)────> [Disputed] ──(Admin Resolves)──> [Resolved]
     └──(Renter Cancels)─> [Cancelled]
```

---

## ⚠️ Known Limitations & Demo Disclosures

1. **Frontend-Only Architecture**: All data is stored in the browser's `localStorage` and `sessionStorage`. Opening the application in an incognito window or another browser starts with the seed baseline.
2. **Security Limitation**: While domain mutation functions strictly check current session, ownership, and role permissions, client-side checks can technically be bypassed by a technical user editing `localStorage` directly in developer tools. In production, a secure Node.js/PostgreSQL backend with signed JWTs or HTTP-only session cookies is required.
3. **Simulated Telemetry**: Vehicle tracking displays pre-calculated waypoints across Addis Ababa for demonstration. No physical IoT hardware is connected.
4. **Simulated Payments**: Telebirr, CBE Birr, and card selections simulate realistic transaction references (`SW-TXN-...`) without charging real funds.
