# Sheggar Wheels — Performance & Optimization Report (PERF.md)

## 1. Actual Production Build Measurements

Measurements taken from the Next.js 14 production build (`npm run build`):

| Page Route | Bundle Size | First Load JS (Shared + Route) | Render Type |
|---|---|---|---|
| `/` (Homepage) | **5.75 kB** | 110 kB | Static Shell |
| `/cars` (Catalogue) | **6.83 kB** | 111 kB | Client with URL State |
| `/cars/[id]` (Details) | **7.63 kB** | 112 kB | Dynamic Route (`ƒ`) |
| `/signin` | **2.77 kB** | 107 kB | Static Shell |
| `/signup` | **1.9 kB** | 106 kB | Static Shell |
| `/checkout` | **5.03 kB** | 109 kB | Client Interactive |
| `/dashboard` | **5.53 kB** | 110 kB | Client Interactive |
| `/bookings` | **5.01 kB** | 109 kB | Client Interactive |
| `/bookings/[id]` | **5.02 kB** | 109 kB | Dynamic Route (`ƒ`) |
| `/bookings/[id]/track` | **6.04 kB** | 110 kB | Dynamic Route (`ƒ`) |
| `/bookings/[id]/review` | **4.48 kB** | 109 kB | Dynamic Route (`ƒ`) |
| `/owner` | **6.22 kB** | 111 kB | Client Interactive |
| `/owner/cars` | **4.76 kB** | 109 kB | Client Interactive |
| `/owner/cars/new` | **4.39 kB** | 109 kB | Client Interactive |
| `/owner/cars/[id]/edit` | **4.24 kB** | 109 kB | Dynamic Route (`ƒ`) |
| `/owner/cars/[id]/availability` | **4.23 kB** | 109 kB | Dynamic Route (`ƒ`) |
| `/owner/cars/[id]/bookings` | **4.28 kB** | 109 kB | Dynamic Route (`ƒ`) |
| `/owner/earnings` | **4.13 kB** | 108 kB | Client Interactive |
| `/owner/reviews` | **3.86 kB** | 108 kB | Client Interactive |
| `/owner/disputes` | **3.78 kB** | 108 kB | Client Interactive |
| `/admin` | **5.57 kB** | 110 kB | Client Interactive |
| `/admin/listings` | **4.5 kB** | 109 kB | Client Interactive |
| `/admin/users` | **4.19 kB** | 108 kB | Client Interactive |
| `/admin/users/[id]` | **4.73 kB** | 109 kB | Dynamic Route (`ƒ`) |
| `/admin/bookings` | **4.62 kB** | 109 kB | Client Interactive |
| `/admin/disputes` | **3.94 kB** | 108 kB | Client Interactive |
| `/admin/disputes/[id]` | **4.76 kB** | 109 kB | Dynamic Route (`ƒ`) |
| `/admin/reports` | **4.28 kB** | 109 kB | Client Interactive |
| `/admin/announcements` | **3.97 kB** | 108 kB | Client Interactive |
| `Shared Baseline JS` | — | **87.4 kB** | React, Next.js runtime |

Total static and dynamic pages generated: **26/26 compiled successfully**.

---

## 2. Test Execution Performance

Measurements taken from the Vitest automated test suite (`npm test`):
- **Total Test Files**: 1
- **Total Test Cases**: 12 (including all 9 negative security scenarios)
- **Transform Time**: 105ms
- **Test Execution Time**: 26ms
- **Total Runner Duration**: 1.94s
- **Pass Rate**: 100% (12 passed, 0 failed)

---

## 3. Implemented Optimizations

1. **Client-Side Dynamic Loading for Heavy Libraries**:
   - `leaflet` and `react-leaflet` are imported dynamically only after component mount, keeping the initial JS bundle lean and avoiding window-reference errors during server pre-rendering.
2. **Debounced Event Subscriptions**:
   - The reactive storage hook listens to targeted `sw_storage_update` custom events rather than polling `localStorage` in an expensive `setInterval` loop.
3. **Controlled Image Rendering & Fallbacks**:
   - Vehicle cards use responsive aspect-ratio wrappers with error trapping (`onError`) to ensure broken external image URLs never cause layout shift or empty image containers.
4. **Clean Route Chunking**:
   - First Load JS across all routes remains strictly between 106 kB and 112 kB, well under recommended 200 kB budget thresholds for mobile networks in Ethiopia.

---

## 4. Known Bottlenecks & Unmeasured Items

- **Unmeasured Network Latency**: In a real Addis Ababa deployment, cellular network speeds on 3G/4G can fluctuate. The application mitigates this by keeping assets bundled under 115 kB.
- **Leaflet OpenStreetMap Tile CDN**: Map tiles are retrieved from standard OpenStreetMap CDN servers. Offline environments will show the graceful textual coordinate fallback.
- **Unmeasured Production Core Web Vitals (LCP/CLS)**: Real-user metrics (RUM) require live deployment and telemetry ingestion, which are unmeasured in this local environment.
