# Sheggar Wheels (ሸገር ዊልስ) — Complete System Explanation & Architecture Guide

Welcome to the comprehensive system guide for **Sheggar Wheels**. This document explains in plain language how the entire platform operates, who uses it, how money flows, and how the end-to-end rental lifecycle works.

---

## 1. What is Sheggar Wheels?

**Sheggar Wheels** is a peer-to-peer (P2P) car rental marketplace tailored specifically for **Addis Ababa, Ethiopia**.

Instead of renting from traditional, bureaucratic car rental agencies that require large cash deposits, paper contracts, and physical office visits, Sheggar Wheels allows private car owners (**Hosts**) to list their parked or underutilized vehicles and rent them directly to verified drivers (**Renters**) in their neighbourhood.

### Real-World Addis Ababa Context:
Vehicles are geo-located in popular neighbourhoods and transport hubs across the capital:
- **Bole** (near Bole International Airport, Medhanialem, Atlas)
- **Kazanchis** (near UNECA, Interluxury, and business districts)
- **Sarbet** (around the AU headquarters, Karl Square)
- **Piassa** (historic downtown and commercial centers)
- **CMC & Ayat** (eastern residential and diplomatic communities)
- **Old Airport** (diplomatic residences and international schools)
- **Megenagna & Mexico Square** (major transit intersections)

All prices are quoted and calculated transparently in **Ethiopian Birr (ETB)**.

---

## 2. The 3 Platform Personas & Their Roles

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SHEGGAR WHEELS ACTORS                         │
├────────────────────┬────────────────────────────┬───────────────────────┤
│     1. RENTER      │       2. CAR HOST          │    3. ADMINISTRATOR   │
│  (Abebe Kebede)    │      (Dawit Haile)         │    (Almaz Worku)      │
├────────────────────┼────────────────────────────┼───────────────────────┤
│ • Finds cars       │ • Lists vehicles           │ • Moderates listings  │
│ • Selects dates    │ • Sets daily rates in ETB  │ • Audits transactions │
│ • Simulates payment│ • Blocks unavailable dates │ • Suspends bad users  │
│ • Tracks route     │ • Approves/Declines trips  │ • Resolves disputes   │
│ • Leaves reviews   │ • Earns 90% net payout     │ • Broadcasts notices  │
│ • Files disputes   │ • Replies to reviews       │ • Exports census/data │
└────────────────────┴────────────────────────────┴───────────────────────┘
```

### Role 1: The Renter (e.g., Abebe Kebede)
- **Goal**: Needs a reliable car for a few days for errands, family visits, business meetings, or weekend trips to Bishoftu or Entoto.
- **Key Actions**:
  - Searches for cars filtered by neighbourhood, price, seats, or transmission.
  - Chooses pickup and return dates.
  - Reviews an itemized fee calculation with no hidden charges.
  - Completes simulated payment using local payment rails (**Telebirr**, **CBE Birr**, or Card).
  - Tracks reservation status on their personal dashboard.
  - Simulates GPS route tracking during an ongoing trip.
  - Submits verified star ratings and written reviews after the trip ends.
  - Can raise a dispute if the vehicle had mechanical issues or differed from its listing.

### Role 2: The Car Host / Owner (e.g., Dawit Haile)
- **Goal**: Owns one or more vehicles that sit idle during weekdays or weekends and wants to earn extra income.
- **Key Actions**:
  - Registers their cars by providing make, model, year, photos, daily rate (ETB), and neighbourhood pickup point.
  - Blocks personal calendar dates so renters cannot book during family use or maintenance.
  - Receives booking requests and reviews the renter's duration and total payout before approving or declining.
  - Hands over the keys and marks the trip "In Progress".
  - Inspects the returned car and marks the trip "Completed" to receive their payout.
  - Tracks monthly income and vehicle utilization.
  - Responds to customer reviews.

### Role 3: The Platform Administrator (e.g., Almaz Worku)
- **Goal**: Protects community safety, ensures vehicle quality, arbitrates disputes, and monitors platform commission.
- **Key Actions**:
  - **Listing Moderation**: Inspects newly created or edited car listings. Approves safe vehicles so they appear in public search; rejects unsafe or incomplete listings.
  - **User Governance**: Inspects user profiles and can suspend fraudulent or abusive renters/hosts. Suspended users are locked out from booking or editing listings.
  - **Dispute Tribunal**: Adjudicates unresolved issues between renters and hosts (e.g., A/C malfunction, drop-off delays) and writes binding resolution findings.
  - **Reports & Auditing**: Downloads RFC 4180 compliant CSV ledgers for financial tracking, user censuses, and disputes.
  - **Broadcast Announcements**: Posts platform notifications (e.g., holiday travel advisories, system updates) that appear in the community bell.

---

## 3. Financial Model & Commission Structure

Sheggar Wheels uses a clean, transparent **90 / 10 revenue model**:

```
                       RENTAL SUB-TOTAL
                    (Daily Rate × Number of Days)
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
   90% TO HOST                                    10% PLATFORM FEE
(Host Net Earnings)                             (Sheggar Wheels Commission)
```

### Example Calculation:
1. **Selected Car**: Toyota Rav4 Hybrid in Bole at `4,500 ETB / day`.
2. **Duration**: 3 rental days.
3. **Trip Subtotal**: `4,500 ETB × 3 days = 13,500 ETB`.
4. **Platform Service Fee (10%)**: `13,500 × 0.10 = 1,350 ETB`.
5. **Gross Total Charged to Renter**: `13,500 + 1,350 = 14,850 ETB`.
6. **Host Net Payout**: `13,500 × 0.90 = 12,150 ETB`.
7. **Platform Retained Commission**: `1,350 ETB`.

There are no surprise deposit deductions or hidden airport surcharges.

---

## 4. The Complete End-to-End User Journey

```
 1. DISCOVERY          2. BOOKING            3. PAYMENT            4. HOST DECISION
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ Renter       │ ───> │ Choose dates │ ───> │ Checkout     │ ───> │ Host approves│
│ searches     │      │ & check      │      │ simulates    │      │ or declines  │
│ catalogue    │      │ availability │      │ Telebirr/CBE │      │ request      │
└──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
                                                                         │
 7. RESOLUTION         6. REVIEW             5. THE TRIP                 ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ Admin files  │ <─── │ Renter rates │ <─── │ Host marks   │ <─── │ Trip marked  │
│ findings if  │      │ host 1-5     │      │ completed    │      │ "In Progress"│
│ disputed     │      │ stars        │      │ on return    │      │ (GPS Track)  │
└──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
```

### Step 1: Browse & Filter
The renter opens the homepage or fleet catalogue. They filter by Addis Ababa neighbourhood (e.g. Bole), transmission (automatic), or seats (5+), and choose their dates.

### Step 2: Instant Cost Estimation & Date Availability Check
The car details page runs a live calculation:
- Verifies the selected dates are not in the past.
- Verifies the host hasn't blocked the dates for personal use.
- Verifies no other active booking already has those dates reserved.
- Calculates days, subtotal, 10% fee, and total ETB.

### Step 3: Temporary Checkout Draft & Payment Simulation
Clicking "Proceed to Checkout" stores the parameters in `sessionStorage` (`sw_checkout_draft_v1`). At checkout:
- Renter reviews dates and pricing breakdown.
- Selects **Telebirr**, **CBE Birr**, or **Mock Card**.
- Clicks "Simulate & Confirm". A unique transaction reference (`SW-TXN-...`) is minted.
- An official receipt is created with status **`requested`**.

### Step 4: Host Approval & Conflict Check
The host logs in and sees the incoming booking request in their dashboard:
- The system re-checks for calendar conflicts before allowing confirmation.
- If approved, status transitions to **`confirmed`**.
- If declined, status transitions to **`declined`** and simulated refund is recorded.

### Step 5: Vehicle Handover & Tracking
On pickup day:
- The host marks the rental **`in_progress`**.
- The renter can open the live tracking route on an interactive Leaflet map to see simulated waypoints across Addis Ababa.

### Step 6: Trip Completion & Review
When the renter returns the car:
- Host marks the trip **`completed`**.
- Host's net earnings (90%) are added to their financial summary.
- The renter is unlocked to submit a **1-to-5 star review** and feedback.
- Host can reply to the review.

### Step 7: Dispute Resolution (If Needed)
If an issue occurred (e.g., mechanical fault or dirty car):
- Renter or host opens a formal dispute.
- Status moves to **`disputed`**.
- Platform administrator reviews statements and writes binding findings. Status transitions to **`resolved`**.

---

## 5. How Browser Storage Works (No Real Database Required)

Because this is a capstone frontend application designed to run without server costs or database setup, data lives in the user's browser:

1. **Persistent Data (`localStorage`)**:
   - `sw_users_v1`: All user profiles (renters, hosts, admins).
   - `sw_cars_v1`: All car listings, photos, specs, and blocked dates.
   - `sw_bookings_v1`: All rental transactions and receipts.
   - `sw_reviews_v1`: Star ratings and reviews.
   - `sw_disputes_v1`: Filed claims and administrative decisions.
   - `sw_announcements_v1`: Broadcast messages.

2. **Session Data (`sessionStorage`)**:
   - `sw_session_v1`: Active persona identity (`renter`, `owner`, or `admin`).
   - `sw_checkout_draft_v1`: The car and date selection in transit to checkout.

3. **Reactive Revalidation**:
   When any mutation occurs (e.g., booking created, listing approved), the storage layer fires a custom window event (`sw_storage_update`). Components listening via the `useLiveStorage` hook automatically re-render with fresh data without needing a full browser reload.

4. **Demo Reset**:
   A "Reset Seed" button in the top banner allows anyone evaluating the app to restore the baseline seed data with 1 click.
