# Sheggar Wheels — Component Boundaries & Browser Limitations (BOUNDARY.md)

## 1. Server vs. Client Component Boundaries

Next.js App Router enforces explicit separation between code that executes in the Node.js build/runtime environment and code that runs in the browser. In Sheggar Wheels:

### Server Components
- **`src/app/layout.tsx`**: Static HTML shell, global font declarations, and metadata definition. Renders the `<DemoBanner />`, `<Navbar />`, `<main>`, and `<Footer />`.
- **`src/app/not-found.tsx`**: Renders 404 recovery page without needing client JavaScript.
- **`src/app/robots.ts` & `src/app/sitemap.ts`**: Statically generated metadata routes executed at build time.

### Client Component Boundaries (`"use client"`)
All interactive pages and state-dependent components are demarcated with `"use client"` because they access browser-only APIs:
- **`src/components/DemoBanner.tsx`**: Interacts with `resetDemoData()` and manages banner dismissal state.
- **`src/components/Navbar.tsx`**: Manages mobile menu drawer, active session dropdown, quick role switching, and routes.
- **`src/components/NotificationBell.tsx`**: Reads `sessionStorage` and `localStorage` to compute real-time alerts.
- **`src/components/RoleGuard.tsx`**: Verifies `getCurrentSession()`, intercepts unauthorized routing, and displays access-denied gates.
- **`src/components/LeafletMap.tsx`**: Dynamically imports the Leaflet DOM library only after the component is mounted in the browser window.
- **Interactive Pages**: `/cars`, `/cars/[id]`, `/checkout`, `/dashboard`, `/bookings/**`, `/owner/**`, and `/admin/**`.

---

## 2. Browser-Only Functionality

| Capability | Browser API Used | Fallback Behavior |
|---|---|---|
| Persistent Data Storage | `window.localStorage` | Initialized with seed baseline; graceful JSON parsing recovery if corrupted. |
| Temporary Session & Drafts | `window.sessionStorage` | Null session; redirects to `/signin?returnUrl=...`. |
| Real-time Revalidation | `window.dispatchEvent(new CustomEvent('sw_storage_update'))` | Storage event listeners on `window` for cross-tab synchronization. |
| Interactive Geo Maps | `leaflet` & `react-leaflet` | Address, neighbourhood, and GPS coordinate textual badge fallback if tiles fail to load or JS is disabled. |
| CSV Data Downloads | `URL.createObjectURL(new Blob(...))` | Formatted tabular view available directly on screen for screen readers and manual inspection. |
| Receipt Printing | `window.print()` | Clean print CSS hiding action buttons and navbar. |

---

## 3. Explicit Browser-Only Limitations

1. **Storage Quota (approx. 5MB)**: Browser `localStorage` is bounded by origin quota limits. Storage helper functions wrap `.setItem()` in try/catch blocks to trap `QuotaExceededError`.
2. **Cross-Device Persistence**: Data created in one browser (e.g. Chrome on desktop) does not synchronize to another device (e.g. Mobile Safari).
3. **No Real-Time Server Push**: Notifications are derived synchronously from the client's local store. There is no WebSocket or server-sent events (SSE) connection.
4. **Client-Side State Tampering**: Because there is no remote server verifying cryptographic tokens, a user who opens DevTools and edits `sw_session_v1` or `sw_cars_v1` can manipulate their own local client state. In a production environment, all business logic and state machine transitions must be verified by a backend server.
