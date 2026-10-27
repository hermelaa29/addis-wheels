import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In to Your Account",
  description:
    "Sign in to Sheggar Wheels to manage your car bookings, trips, and vehicle listings across Addis Ababa.",
  alternates: {
    canonical: "/signin",
  },
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
