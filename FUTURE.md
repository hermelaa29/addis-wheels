# Sheggar Wheels — Future Production Roadmap & Backend Migration (FUTURE.md)

## 1. Features Requiring a Real Backend

To transition Sheggar Wheels from this frontend capstone prototype into a commercial, multi-tenant production platform in Addis Ababa, the following backend systems should be implemented:

### 1. Database & Persistence
- **Relational Storage (PostgreSQL)**: Migrate `sw_users_v1`, `sw_cars_v1`, `sw_bookings_v1`, `sw_reviews_v1`, `sw_disputes_v1`, and `sw_announcements_v1` into relational tables with foreign keys and ACID transaction guarantees.
- **Transactional Row Locking (`SELECT ... FOR UPDATE`)**: Prevent race conditions when two renters simultaneously attempt to book the exact same vehicle for overlapping dates.
- **Prisma OR Drizzle ORM**: Type-safe database queries and automated schema migrations.

### 2. Real Telebirr & CBE Payment Gateway Integration
- **Telebirr SuperApp Mini Program / H5 Gateway**: Real-time integration with Ethio Telecom's Telebirr API for payment initiation, checkout QR generation, and server-to-server webhook callbacks (`verifyPaymentNotification`).
- **Commercial Bank of Ethiopia (CBE Birr)**: Direct host settlement and escrow deposit handling.
- **Automated Payout Engine**: Automatic distribution of 90% rental fees to hosts upon digital check-out confirmation.

### 3. Hardware GPS Telematics Integration
- **OBD-II / CAN-Bus Telematics**: Ingestion of real vehicle GPS pings, odometer readings, and fuel levels into an IoT message broker (e.g. MQTT or AWS IoT Core).
- **Geofencing**: Automatic alerts when rented vehicles travel outside authorized zones (e.g. beyond Addis Ababa ring road or outside Oromia regional boundaries).

### 4. Push Notifications & SMS Alerts
- **SMS Gateway (Ethio Telecom Shortcode)**: Real-time SMS alerts to hosts when booking requests are received, and to renters when requests are confirmed.
- **Web Push Notifications**: Service worker push alerts across mobile devices.

---

## 2. Recommended Future Security Improvements

1. **HTTP-Only, Secure Session Cookies**:
   - Replace `sessionStorage` tokens with server-issued JWTs stored in HTTP-Only, `SameSite=Strict`, `Secure` cookies to eradicate cross-site scripting (XSS) credential theft.
2. **National ID (Fayda / Driver's License) Verification**:
   - Verification API with the Ethiopian National ID Program (Fayda) to validate renter driving eligibility, photo IDs, and criminal background clearances before first booking.
3. **Role-Based Access Control (RBAC) on the Server**:
   - Enforce cryptographic validation of administrator privileges at the API gateway layer.
4. **Cloud Object Storage (S3 / Cloudflare R2)**:
   - Direct image uploads with virus scanning and EXIF sanitization rather than external image URLs.
5. **Rate Limiting & Anti-Scraping**:
   - Redis-backed rate limiting on catalogue search endpoints and booking creation routes.
