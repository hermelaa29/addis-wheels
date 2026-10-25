import { z } from "zod";

/**
 * Zod validation schemas for Sheggar Wheels
 */

// User Sign In validation schema
export const SignInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});
export type SignInInput = z.infer<typeof SignInSchema>;

// User Sign Up validation schema
export const SignUpSchema = z.object({
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must not exceed 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .min(9, "Phone number is required")
    .regex(
      /^(\+251|0)(9\d{8}|7\d{8})$/,
      "Enter a valid Ethiopian phone number (e.g. 0911223344 or +251911223344)"
    ),
  role: z.enum(["renter", "owner"]).default("renter"),
});
export type SignUpInput = z.infer<typeof SignUpSchema>;

// Vehicle Listing & Edit validation schema
export const CarListingSchema = z.object({
  make: z.string().min(2, "Make is required (e.g., Toyota)"),
  model: z.string().min(1, "Model is required (e.g., RAV4)"),
  year: z
    .number({ invalid_type_error: "Year must be a number" })
    .int("Year must be an integer")
    .min(1995, "Year must be 1995 or newer")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  transmission: z.enum(["Automatic", "Manual", "automatic", "manual"], {
    errorMap: () => ({ message: "Transmission must be Automatic or Manual" }),
  }),
  seats: z
    .number({ invalid_type_error: "Seats must be a number" })
    .int("Seats must be an integer")
    .min(2, "Minimum 2 seats")
    .max(15, "Maximum 15 seats"),
  pricePerDay: z
    .number({ invalid_type_error: "Daily rate must be a number" })
    .min(500, "Daily rate must be at least 500 ETB")
    .max(50000, "Daily rate cannot exceed 50,000 ETB"),
  city: z.string().min(1, "City is required").default("Addis Ababa"),
  neighbourhood: z.string().min(2, "Neighbourhood is required (e.g., Bole, Kazanchis)"),
  latitude: z
    .number()
    .min(8.5, "Latitude must be within Addis Ababa area (~8.8 to 9.2)")
    .max(9.2, "Latitude must be within Addis Ababa area (~8.8 to 9.2)"),
  longitude: z
    .number()
    .min(38.5, "Longitude must be within Addis Ababa area (~38.6 to 39.0)")
    .max(39.0, "Longitude must be within Addis Ababa area (~38.6 to 39.0)"),
  photos: z
    .array(z.string().url("Must be a valid photo URL"))
    .min(1, "At least one vehicle photo URL is required"),
  description: z
    .string()
    .min(20, "Vehicle description must be at least 20 characters for renter clarity")
    .max(1000, "Description must be under 1000 characters"),
});
export type CarListingInput = z.infer<typeof CarListingSchema>;

// Booking Date Range validation schema
export const BookingDatesSchema = z
  .object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
  })
  .refine(
    (data) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(data.startDate);
      return start >= today;
    },
    {
      message: "Start date cannot be in the past",
      path: ["startDate"],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    {
      message: "End date must be on or after the start date",
      path: ["endDate"],
    }
  );
export type BookingDatesInput = z.infer<typeof BookingDatesSchema>;

// Review Submission schema
export const ReviewSchema = z.object({
  rating: z
    .number({ invalid_type_error: "Rating is required" })
    .int()
    .min(1, "Rating must be between 1 and 5 stars")
    .max(5, "Rating must be between 1 and 5 stars"),
  comment: z
    .string()
    .min(10, "Review comment must be at least 10 characters")
    .max(500, "Review comment must not exceed 500 characters"),
});
export type ReviewInput = z.infer<typeof ReviewSchema>;

// Dispute Submission schema
export const DisputeSchema = z.object({
  reason: z.string().min(3, "Please select or provide a dispute reason"),
  description: z
    .string()
    .min(20, "Dispute details must be at least 20 characters to assist arbitration")
    .max(1000, "Description cannot exceed 1000 characters"),
});
export type DisputeInput = z.infer<typeof DisputeSchema>;

// Broadcast Announcement schema
export const AnnouncementSchema = z.object({
  title: z
    .string()
    .min(5, "Announcement title must be at least 5 characters")
    .max(100, "Title cannot exceed 100 characters"),
  message: z
    .string()
    .min(10, "Announcement message must be at least 10 characters")
    .max(500, "Message cannot exceed 500 characters"),
});
export type AnnouncementInput = z.infer<typeof AnnouncementSchema>;
