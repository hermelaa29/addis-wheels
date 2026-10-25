import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = "https://sheggarwheels.et";

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
