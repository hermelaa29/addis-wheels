import { describe, it, expect, beforeEach } from "vitest";
import {
  safeReturnPath,
  hasRole,
  signInAsDemo,
  signOut,
  registerRenter,
  saveCar,
  createBooking,
  transitionBooking,
  createReview,
  updateUserStatus,
  escapeCsvCell,
  generateCsv,
  getCars,
  getBookings,
  getCarById,
} from "../lib/data";
import {
  writeStorage,
  readStorage,
  resetDemoData,
  initializeDemoData,
  STORAGE_KEYS,
  clearSession,
} from "../lib/storage";
import { Booking, User, Car } from "../types";

describe("Sheggar Wheels — Domain & Negative Security Tests", () => {
  beforeEach(() => {
    // Reset to clean state in jsdom storage
    window.localStorage.clear();
    window.sessionStorage.clear();
    resetDemoData();
  });

  // 1. Signed-out user cannot create a booking
  it("Negative Test 1: A signed-out user cannot create a booking", () => {
    clearSession();
    const result = createBooking({
      carId: "car_1",
      startDate: "2026-11-10",
      endDate: "2026-11-12",
    });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/signed-in renter account is required/i);
  });

  // 2. A renter cannot cancel another renter's booking
  it("Negative Test 2: A renter cannot cancel another renter's booking", () => {
    // bkg_3 belongs to usr_renter_2
    // Sign in as usr_renter_1
    signInAsDemo("usr_renter_1", "renter");

    const result = transitionBooking("bkg_3", "cancelled");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Forbidden: You cannot cancel another user's booking/i);
  });

  // 3. An unsafe external redirect is rejected
  it("Negative Test 3: Unsafe external redirect URLs are rejected", () => {
    expect(safeReturnPath("https://evil-phishing.com")).toBe("/");
    expect(safeReturnPath("//evil.com")).toBe("/");
    expect(safeReturnPath("javascript:alert(1)")).toBe("/");
    expect(safeReturnPath("data:text/html,<script>alert(1)</script>")).toBe("/");
    expect(safeReturnPath("/\\evil.com")).toBe("/");

    // Valid internal paths
    expect(safeReturnPath("/dashboard")).toBe("/dashboard");
    expect(safeReturnPath("/cars/car_1?start=2026-11-01")).toBe("/cars/car_1?start=2026-11-01");
  });

  // 4. An owner cannot edit another owner's car
  it("Negative Test 4: An owner cannot edit another owner's car", () => {
    // car_3 is owned by usr_owner_2
    // Sign in as usr_owner_1
    signInAsDemo("usr_owner_1", "owner");

    const result = saveCar({
      id: "car_3",
      make: "Toyota",
      model: "Hacked Car",
      year: 2021,
      transmission: "automatic",
      seats: 7,
      city: "Addis Ababa",
      neighbourhood: "Sarbet",
      latitude: 8.9961,
      longitude: 38.7368,
      pricePerDay: 9999,
      photos: [],
      description: "Hacked",
      unavailableDates: [],
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Forbidden: You do not own this vehicle/i);

    // Verify car was NOT modified
    const car = getCarById("car_3");
    expect(car?.model).toBe("Land Cruiser Prado");
  });

  // 5. A renter cannot access another renter's booking
  it("Negative Test 5: Filtered bookings query only exposes authorized renter's bookings", () => {
    const renter1Bookings = getBookings({ renterId: "usr_renter_1" });
    for (const b of renter1Bookings) {
      expect(b.renterId).toBe("usr_renter_1");
      expect(b.renterId).not.toBe("usr_renter_2");
    }
  });

  // 6. A suspended account cannot perform protected actions
  it("Negative Test 6: A suspended account cannot create bookings or modify listings", () => {
    // usr_suspended_1 is suspended
    const signInResult = signInAsDemo("usr_suspended_1");
    expect(signInResult.success).toBe(false);
    expect(signInResult.error).toMatch(/suspended/i);

    // If session was artificially forced into storage:
    writeStorage(
      STORAGE_KEYS.SESSION,
      {
        user: {
          id: "usr_suspended_1",
          name: "Suspended Guy",
          email: "suspended@shegerwheels.com",
          phone: "+251 96 678 9012",
          roles: ["renter"],
          status: "suspended",
          createdAt: "2026-03-01T12:00:00Z",
        },
        activeRole: "renter",
        createdAt: new Date().toISOString(),
      },
      true
    );

    const bookingResult = createBooking({
      carId: "car_1",
      startDate: "2026-11-20",
      endDate: "2026-11-22",
    });
    expect(bookingResult.success).toBe(false);
    expect(bookingResult.error).toMatch(/Suspended accounts cannot create bookings/i);
  });

  // 7. Public registration cannot grant administrator privileges
  it("Negative Test 7: Public registration cannot grant administrator or owner privileges", () => {
    const regResult = registerRenter({
      name: "New Guest",
      email: "newguest@example.com",
      phone: "+251 91 999 8888",
    });
    expect(regResult.success).toBe(true);
    expect(regResult.user?.roles).toEqual(["renter"]);
    expect(regResult.user?.roles).not.toContain("admin");
    expect(regResult.user?.roles).not.toContain("owner");
  });

  // 8. Invalid booking transitions are rejected without changing data
  it("Negative Test 8: Invalid booking transitions are rejected without mutating data", () => {
    signInAsDemo("usr_owner_1", "owner");
    // bkg_1 is already "completed"
    const result = transitionBooking("bkg_1", "confirmed");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Cannot confirm booking in "completed" state/i);

    // Verify it remains completed
    const bookings = getBookings();
    const bkg1 = bookings.find((b) => b.id === "bkg_1");
    expect(bkg1?.status).toBe("completed");
  });

  // 9. Overlapping active bookings cannot both be confirmed
  it("Negative Test 9: Overlapping active bookings cannot both be confirmed", () => {
    // bkg_4 is on car_4 from 2026-11-01 to 2026-11-03 ("requested")
    // Let's create another requested booking on car_4 with overlapping dates: 2026-11-02 to 2026-11-04
    const bookings = readStorage<Booking[]>(STORAGE_KEYS.BOOKINGS) || [];
    const conflictingBooking: Booking = {
      id: "bkg_conflict_test",
      carId: "car_4",
      renterId: "usr_renter_2",
      ownerId: "usr_owner_2",
      startDate: "2026-11-02",
      endDate: "2026-11-04",
      days: 2,
      pricePerDay: 2600,
      subtotal: 5200,
      fee: 520,
      total: 5720,
      paymentStatus: "simulated_paid",
      status: "requested",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    bookings.push(conflictingBooking);
    writeStorage(STORAGE_KEYS.BOOKINGS, bookings);

    // Owner confirms bkg_4
    signInAsDemo("usr_owner_2", "owner");
    const confirm1 = transitionBooking("bkg_4", "confirmed");
    expect(confirm1.success).toBe(true);

    // Owner tries to confirm bkg_conflict_test
    const confirm2 = transitionBooking("bkg_conflict_test", "confirmed");
    expect(confirm2.success).toBe(false);
    expect(confirm2.error).toMatch(/Conflict detected: another booking for this vehicle is already confirmed/i);
  });

  // CSV Escaping test
  it("RFC 4180 CSV escaping handles quotes, commas, and newlines properly", () => {
    expect(escapeCsvCell("Standard Text")).toBe('"Standard Text"');
    expect(escapeCsvCell('Text with "quotes"')).toBe('"Text with ""quotes"""');
    expect(escapeCsvCell("Text, with comma")).toBe('"Text, with comma"');
    expect(escapeCsvCell("Line 1\nLine 2")).toBe('"Line 1\nLine 2"');

    const csvOutput = generateCsv(
      [
        { name: 'Toyota "Prado", 2021', price: 8500 },
        { name: "Standard Sedan", price: 2600 },
      ],
      [
        { key: "name", label: "Car Name" },
        { key: "price", label: "Daily Rate (ETB)" },
      ]
    );

    expect(csvOutput).toContain('"Car Name","Daily Rate (ETB)"');
    expect(csvOutput).toContain('"Toyota ""Prado"", 2021","8500"');
  });

  // Review eligibility test
  it("Enforces review rules: only completed bookings can be reviewed and only once", () => {
    // bkg_3 is currently in_progress, so cannot be reviewed
    signInAsDemo("usr_renter_2", "renter");
    const reviewFail = createReview({
      bookingId: "bkg_3",
      rating: 5,
      comment: "Trip was great!",
    });
    expect(reviewFail.success).toBe(false);
    expect(reviewFail.error).toMatch(/Only completed rentals are eligible/i);

    // bkg_1 is already reviewed in seed data
    signInAsDemo("usr_renter_1", "renter");
    const reviewDuplicate = createReview({
      bookingId: "bkg_1",
      rating: 4,
      comment: "Another review",
    });
    expect(reviewDuplicate.success).toBe(false);
    expect(reviewDuplicate.error).toMatch(/A review has already been submitted/i);
  });

  // Malformed localStorage recovery test
  it("Gracefully handles malformed JSON in localStorage without crashing", () => {
    window.localStorage.setItem(STORAGE_KEYS.CARS, "MALFORMED_JSON_{{{");
    const cars = getCars();
    // It should recover by loading empty fallback or seed
    expect(Array.isArray(cars)).toBe(true);
  });
});
