import { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "https://addis-wheels.vercel.app";

export default function robots(): MetadataRoute.Robots {

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/cars", "/signin", "/signup"],
      disallow: [
        "/dashboard",
        "/bookings",
        "/checkout",
        "/owner",
        "/owner/*",
        "/admin",
        "/admin/*",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
