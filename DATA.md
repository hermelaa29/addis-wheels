# Sheggar Wheels — Data Layer & State Machine (DATA.md)

## 1. Storage Keys & Scopes

Sheggar Wheels isolates data into distinct namespaces in browser storage:

| Storage Key | Storage Mechanism | Schema Type | Description |
|---|---|---|---|
| `sw_users_v1` | `localStorage` | `User[]` | Registered renters, hosts, and administrator directory. |
| `sw_cars_v1` | `localStorage` | `Car[]` | Vehicle fleet listings, specs, photos, rates, and blocked dates. |
| `sw_bookings_v1` | `localStorage` | `Booking[]` | All rental reservations, pricing breakdowns, and lifecycle statuses. |
| `sw_reviews_v1` | `localStorage` | `Review[]` | Verified ratings (1–5), renter comments, and host responses. |
| `sw_disputes_v1` | `localStorage` | `Dispute[]` | Claims, statements, and administrative adjudication notes. |
| `sw_announcements_v1` | `localStorage` | `Announcement[]` | Platform broadcasts and community notices. |
| `sw_session_v1` | `sessionStorage` | `SessionData` | Temporary active session identity and active role mode. |
| `sw_checkout_draft_v1` | `sessionStorage` | `CheckoutDraft` | Transient booking draft between vehicle selection and payment simulation. |

---

## 2. Entity Schemas

### User
```typescript
interface User {
  id: string; // e.g. "usr_renter_1"
  name: string;
  email: string;
  phone: string;
  roles: ("renter" | "owner" | "admin")[];
  status: "active" | "suspended";
  createdAt: string; // ISO 8601
}
```

### Car
```typescript
interface Car {
  id: string; // e.g. "car_1"
  ownerId: string; // references User.id
  make: string;
  model: string;
  year: number;
  transmission: "automatic" | "manual";
  seats: number;
  city: string; // "Addis Ababa"
  neighbourhood: string; // e.g. "Bole", "Kazanchis", "Sarbet", "Piassa", etc.
  latitude: number;
  longitude: number;
  pricePerDay: number; // in Ethiopian Birr (ETB)
  photos: string[];
  description: string;
  status: "approved" | "pending" | "rejected" | "inactive";
  unavailableDates: string[]; // ISO YYYY-MM-DD
  createdAt: string;
}
```

### Booking
```typescript
interface Booking {
  id: string; // e.g. "bkg_1"
  carId: string;
  renterId: string;
  ownerId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  days: number;
  pricePerDay: number;
  subtotal: number; // pricePerDay * days
  fee: number; // 10% platform service fee
  total: number; // subtotal + fee
  paymentStatus: "simulated_paid" | "pending" | "refunded";
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  transactionRef?: string;
  cancellationReason?: string;
}
```

### Review
```typescript
interface Review {
  id: string;
  bookingId: string;
  carId: string;
  renterId: string;
  ownerId: string;
  rating: number; // 1 to 5 stars
  comment: string;
  ownerReply?: string;
  createdAt: string;
}
```

### Dispute
```typescript
interface Dispute {
  id: string;
  bookingId: string;
  openedBy: string; // User.id
  reason: string;
  description: string;
  status: "open" | "under_review" | "resolved";
  resolutionNotes?: string;
  resolvedBy?: string; // Admin User.id
  createdAt: string;
  resolvedAt?: string;
}
```

### Announcement
```typescript
interface Announcement {
  id: string;
  title: string;
  message: string;
  active: boolean;
  createdAt: string;
  createdBy: string;
}
```

---

## 3. Booking State Transitions & Transition Rules

```
                      ┌───────────────┐
                      │   requested   │
                      └───────┬───────┘
           ┌──────────────────┼──────────────────┐
           │ (host confirms)  │ (host declines)  │ (renter cancels)
           ▼                  ▼                  ▼
     ┌───────────┐      ┌───────────┐      ┌───────────┐
     │ confirmed │      │ declined  │      │ cancelled │
     └─────┬─────┘      └───────────┘      └───────────┘
           │ (trip starts)    │ (eligible cancel)
           ▼                  └──────────────────┐
    ┌─────────────┐                              │
    │ in_progress │                              │
    └──────┬──────┘                              │
           │ (trip ends)                         ▼
           ├──────────────────────────────> ┌───────────┐
           │                                │ cancelled │
           ▼                                └───────────┘
    ┌───────────┐
    │ completed │ ──(renter reviews)──> [Review Submitted]
    └─────┬─────┘
          │ (claim opened)
          ▼
    ┌───────────┐
    │ disputed  │ ──(admin resolves)──> [Resolved]
    └───────────┘
```

### Enforced Rules:
1. **Re-validation on Confirmation**: When a host confirms a booking, the system re-checks for overlapping active (`confirmed` or `in_progress`) bookings on that vehicle. Conflicting bookings are rejected.
2. **Terminal Statuses**: `declined` and `cancelled` bookings cannot transition back to `confirmed`.
3. **Single Review Rule**: Only the renter who finished a `completed` booking can submit a review, and only once.
4. **Permanent Dispute Resolution**: Once marked `resolved` by an administrator, the dispute cannot be re-adjudicated.

---

## 4. Resilience & Data Recovery

- **Corrupted JSON Recovery**: `readStorage` wraps `JSON.parse` in a try/catch block. Malformed storage keys log a warning and return empty arrays or trigger automatic seed restoration.
- **Factory Reset**: Users can reset demo data at any time via the "Reset Demo Data" button in the `<DemoBanner />`.
- **RFC 4180 CSV Escaping**: All CSV export functions escape embedded commas, quotes (`" -> ""``), and newlines, ensuring file integrity when opened in Microsoft Excel or Google Sheets.
