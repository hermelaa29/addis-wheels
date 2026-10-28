import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteConfig";

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
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
