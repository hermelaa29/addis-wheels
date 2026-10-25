# Sheggar Wheels — Rendering Strategy & Architecture (STRATEGY.md)

## 1. Architectural Philosophy

Sheggar Wheels is structured using the **Next.js App Router** with a hybrid rendering architecture. Because this capstone is a frontend-only platform where persistent state resides in the user's browser (`localStorage` and `sessionStorage`), the rendering strategy specifically balances:
1. **Server-rendered static shells and metadata** for SEO, discoverability, accessibility, and fast first-contentful-paint (FCP).
2. **Client Component interactive boundaries** for client-side storage access, reactive event dispatching, Leaflet interactive mapping, dynamic date validation, and chart rendering.
3. **Strict hydration mismatch prevention**: Browser storage APIs (`window.localStorage`) are never called during server execution or pre-hydration passes. Components utilize an `isMounted` gate and reactive storage subscriptions.

---

## 2. Route-by-Route Rendering Breakdown

| Route | Render Type | Shell & Metadata | Interactive Components | Rationale |
|---|---|---|---|---|
| `/` | Client Interactive Shell | Root layout provides global SEO metadata, title, and OpenGraph tags | Hero search, date pickers, live featured car cards, dynamic storage reads | Hero form needs interactive date pickers and navigation with URL search params; featured cars update reactively when new cars are approved. |
| `/cars` | Client Component | Static App Router shell with query param synchronization | FilterBar, search inputs, sorting select, pagination controls, Leaflet map toggle | Deep URL query parameter reflection (`?neighbourhood=Bole&sort=price_asc`), client-side filtering, and responsive map rendering. |
| `/cars/[id]` | Client Dynamic (`ƒ`) | Static metadata template + dynamic route params | Date range selection, live pricing estimator, availability conflict detector, Leaflet pin map, review list | Live price calculator dynamically re-computes subtotal and 10% fee based on selected dates. Reads from `sw_cars_v1` and `sw_reviews_v1`. |
| `/signin` | Client Component | Metadata shell | Persona selector buttons, session writer, safe redirect processor | Interacts directly with `sessionStorage` and validates `returnUrl` against open-redirect attacks. |
| `/signup` | Client Component | Metadata shell | Registration form, unique email validation, Zod verification | Writes new user to `sw_users_v1` and initializes new Renter session. |
| `/checkout` | Client Component | Protected via `RoleGuard` | Draft loader from `sessionStorage`, payment simulation options, booking creator | Consumes `sw_checkout_draft_v1`, simulates transaction, prevents double submission, and writes to `sw_bookings_v1`. |
| `/dashboard` | Client Component | Protected via `RoleGuard` | Spending metrics, active booking alert, booking table, cancellation action, CSV exporter | Reads and mutates `sw_bookings_v1` reactive to the logged-in renter ID. |
| `/bookings` | Client Component | Protected via `RoleGuard` | Search bar, status filter dropdown, receipt links, CSV exporter | Comprehensive audit of renter's bookings with table sorting and status filtering. |
| `/bookings/[id]` | Client Dynamic (`ƒ`) | Protected via `RoleGuard` | Receipt printer, cancellation trigger, dispute modal, review button | Itemized breakdown of agreed daily rate, duration, and fee. Enforces renter/owner/admin authorization. |
| `/bookings/[id]/track` | Client Dynamic (`ƒ`) | Protected via `RoleGuard` | Leaflet map with Addis Ababa polyline and waypoint cards | Map must load client-side. Transparent disclaimer that telemetry is simulated. |
| `/bookings/[id]/review` | Client Dynamic (`ƒ`) | Protected via `RoleGuard` | Star rating selector, feedback form, duplicate review check | Enforces completion criteria and single review per booking. |
| `/owner` | Client Component | Protected via `RoleGuard` | Fleet counts, request approval/decline buttons, earnings cards, monthly trend bars | Central host hub that triggers booking state machine transitions with conflict checks. |
| `/owner/cars` | Client Component | Protected via `RoleGuard` | Host car inventory cards, availability links, edit links | Filters `sw_cars_v1` to the current host's vehicles only. |
| `/owner/cars/new` | Client Component | Protected via `RoleGuard` | Listing form with Addis Ababa neighbourhood coordinates and validation | Creates new car with `pending` status for admin moderation queue. |
| `/owner/cars/[id]/edit` | Client Dynamic (`ƒ`) | Protected via `RoleGuard` | Edit form, ownership verification guard | Prevents cross-host tampering. Puts modified listings back into moderation queue. |
| `/owner/cars/[id]/availability` | Client Dynamic (`ƒ`) | Protected via `RoleGuard` | Blocked date calendar manager (add/remove) | Directly updates `unavailableDates` to prevent bookings on selected dates. |
| `/owner/cars/[id]/bookings` | Client Dynamic (`ƒ`) | Protected via `RoleGuard` | Vehicle-specific reservation history and approval actions | Isolated audit of bookings on a single host vehicle. |
| `/owner/earnings` | Client Component | Protected via `RoleGuard` | Earnings summary, 90% net payout calculation, per-vehicle performance, CSV export | Host financial reporting adhering to the 90/10 commission model. |
| `/owner/reviews` | Client Component | Protected via `RoleGuard` | Review list on host cars, host reply form and publisher | Allows vehicle hosts to respond to feedback. |
| `/owner/disputes` | Client Component | Protected via `RoleGuard` | Dispute viewer for claims on host bookings | Read-only dispute viewer with admin resolution findings. |
| `/admin` | Client Component | Protected via `RoleGuard` | Platform KPI cards, moderation queue quick-actions, booking volume trend | Executive dashboard for platform administrator. |
| `/admin/listings` | Client Component | Protected via `RoleGuard` | Moderation table (approve/reject), status filters | Controls public discoverability of vehicle listings. |
| `/admin/users` | Client Component | Protected via `RoleGuard` | User table, role filters, search, suspend/reinstate toggle | User directory and account suspension controls. |
| `/admin/users/[id]` | Client Dynamic (`ƒ`) | Protected via `RoleGuard` | Profile inspector, host cars list, renter booking history, suspension button | Detailed user investigation and account moderation. |
| `/admin/bookings` | Client Component | Protected via `RoleGuard` | Master booking table, status filters, CSV export | Complete audit trail of all marketplace transactions. |
| `/admin/disputes` | Client Component | Protected via `RoleGuard` | Master dispute table, status filters | Queue of unresolved renter and host claims. |
| `/admin/disputes/[id]` | Client Dynamic (`ƒ`) | Protected via `RoleGuard` | Adjudication form, binding resolution note logger | Resolves disputes, records administrator ID, and marks status as resolved. |
| `/admin/reports` | Client Component | Protected via `RoleGuard` | 3 CSV export generators, KPI summary dl | Financial ledger, user census, and dispute ledger downloads. |
| `/admin/announcements` | Client Component | Protected via `RoleGuard` | Announcement creator, active toggle, broadcast list | Real-time community notices broadcast to all users. |
| `/not-found` | Static Server Shell | Static layout and branding | Recovery links to Home and Fleet | 404 error page. |
| `/robots.txt` | Static Route (`robots.ts`) | Server generated | Text response | Blocks crawler access to private dashboards; allows public catalogue. |
| `/sitemap.xml` | Static Route (`sitemap.ts`) | Server generated | XML response | Lists all public routes and seeded vehicle listings. |

---

## 3. Hydration Protection Mechanism

To prevent React hydration mismatches:
1. Components initialize with safe initial states (e.g. empty lists or null sessions).
2. The custom `useIsMounted()` hook delays reading browser storage until after the initial client mount:
   ```typescript
   export function useIsMounted(): boolean {
     const [mounted, setMounted] = useState(false);
     useEffect(() => {
       setMounted(true);
       initializeDemoData();
     }, []);
     return mounted;
   }
   ```
3. A global custom event `sw_storage_update` is dispatched on every mutation. Reactive hooks re-synchronize state across components without forcing full page reloads.
