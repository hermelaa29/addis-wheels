import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an Account",
  description:
    "Join Sheggar Wheels to rent verified cars peer-to-peer or list your vehicle for extra income across Addis Ababa.",
  alternates: {
    canonical: "/signup",
  },
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
