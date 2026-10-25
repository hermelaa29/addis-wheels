# Sheggar Wheels — Authentication, Authorization & Security (AUTH.md)

## 1. Demo Authentication Architecture

Sheggar Wheels implements a robust demo authentication system designed to enable thorough functional evaluation without requiring real third-party credentials or a live database.

- **Storage Location**: Active sessions are persisted in `sessionStorage` under the key `sw_session_v1`.
- **Session Structure**:
  ```typescript
  interface SessionData {
    user: User;
    activeRole: "renter" | "owner" | "admin";
    createdAt: string; // ISO 8601
  }
  ```
- **1-Click Demo Personas**: Pre-seeded on the `/signin` page for immediate evaluation across all roles:
  1. `usr_renter_1` ("Abebe Kebede") — Standard Renter
  2. `usr_owner_1` ("Dawit Haile") — Vehicle Host
  3. `usr_admin_1` ("Almaz Worku") — Platform Administrator
  4. `usr_suspended_1` ("Yohannes Berhanu") — Suspended account for negative testing

---

## 2. Role Permissions & Capabilities

| Action / Route | Guest | Renter | Host / Owner | Administrator |
|---|:---:|:---:|:---:|:---:|
| Browse Fleet (`/cars`, `/cars/[id]`) | ✅ | ✅ | ✅ | ✅ |
| Initiate Booking Draft | ✅ (prompts sign-in) | ✅ | ✅ | ✅ |
| Confirm Checkout (`/checkout`) | ❌ | ✅ | ✅ | ✅ |
| Manage My Bookings (`/dashboard`, `/bookings`) | ❌ | ✅ (own only) | ✅ (own only) | ✅ (own only) |
| Live GPS Tracking (`/bookings/[id]/track`) | ❌ | ✅ (own only) | ❌ | ✅ |
| Submit Review (`/bookings/[id]/review`) | ❌ | ✅ (if completed) | ❌ | ❌ |
| Host Hub (`/owner`) | ❌ | ❌ | ✅ | ✅ |
| Create Vehicle Listing (`/owner/cars/new`) | ❌ | ❌ | ✅ | ✅ |
| Edit Vehicle Listing (`/owner/cars/[id]/edit`) | ❌ | ❌ | ✅ (own only) | ✅ |
| Manage Availability (`/owner/cars/[id]/availability`)| ❌ | ❌ | ✅ (own only) | ✅ |
| Approve / Decline Booking Requests | ❌ | ❌ | ✅ (own car only) | ✅ |
| Export Host Financial CSV (`/owner/earnings`) | ❌ | ❌ | ✅ (own car only) | ✅ |
| Reply to Reviews (`/owner/reviews`) | ❌ | ❌ | ✅ (own car only) | ✅ |
| Admin Console (`/admin`) | ❌ | ❌ | ❌ | ✅ |
| Moderate Vehicles (Approve/Reject) | ❌ | ❌ | ❌ | ✅ |
| Suspend / Reinstate Users | ❌ | ❌ | ❌ | ✅ |
| Adjudicate Disputes (`/admin/disputes/[id]`) | ❌ | ❌ | ❌ | ✅ |
| Platform CSV Audits (`/admin/reports`) | ❌ | ❌ | ❌ | ✅ |
| Broadcast Announcements (`/admin/announcements`) | ❌ | ❌ | ❌ | ✅ |

---

## 3. Defense-in-Depth Ownership Validation

Authorization is enforced at **two independent levels**:

1. **UI Presentation Level (`RoleGuard`)**: Intercepts routing, verifies session existence and active roles, checks suspension status, and redirects unauthenticated users to `/signin?returnUrl=...`.
2. **Domain Mutation Level (`src/lib/data.ts`)**: Every state-changing domain function validates permissions against the active session before mutating data:
   - `saveCar`: Rejects if the user does not own the vehicle and is not an administrator.
   - `createBooking`: Rejects if user is suspended, not signed in, or attempts to rent their own car.
   - `transitionBooking`: Checks actor permissions (e.g. only the car owner can confirm or decline; only the booking renter can cancel; only an admin can resolve disputes).
   - `createReview`: Checks that the booking status is `completed`, the caller is the booking's renter, and no prior review exists for that booking.

---

## 4. Nine Negative Security Tests (Automated & Verified)

Automated tests in `src/__tests__/domain.test.ts` verify all nine required negative scenarios:

1. **A signed-out user cannot create a booking**: `createBooking` checks for active session and returns `{ success: false, error: "A signed-in renter account is required..." }`.
2. **A renter cannot cancel another renter's booking**: `transitionBooking` verifies `booking.renterId === session.user.id`, returning `{ success: false, error: "Forbidden: You cannot cancel another user's booking" }`.
3. **An unsafe external redirect is rejected**: `safeReturnPath` rejects `https://evil.com`, `//evil.com`, `javascript:alert(1)`, and `/\\evil.com`, falling back safely to `/`.
4. **An owner cannot edit another owner's car**: `saveCar` verifies `car.ownerId === session.user.id`, returning `{ success: false, error: "Forbidden: You do not own this vehicle" }`.
5. **A renter cannot access another renter's booking**: `getBookings({ renterId })` strictly scopes returned records to the authenticated renter ID.
6. **A suspended account cannot perform protected actions**: Suspended users cannot sign in, create bookings, modify listings, or submit reviews.
7. **Public registration cannot grant administrator privileges**: `registerRenter` strictly assigns `roles: ["renter"]`, ignoring attempts to escalate to owner or admin.
8. **Invalid booking transitions are rejected without changing data**: Attempting to confirm a completed booking is rejected with `{ success: false, error: "Cannot confirm booking in 'completed' state" }`, preserving stored data intact.
9. **Overlapping active bookings cannot both be confirmed**: Double-booking conflict detector re-validates calendar overlap upon host confirmation. If a conflicting booking is confirmed, subsequent confirmation is blocked.

---

## 5. Explicit Security Limitations

> [!WARNING]
> This application is a frontend capstone prototype running on browser storage. Because there is no backend server verifying cryptographic tokens (e.g., signed JWTs or HTTP-only cookies), any user with access to browser developer tools can inspect or edit `localStorage`. This is intentional for demonstrative prototype evaluation and must never be represented as production authentication.
