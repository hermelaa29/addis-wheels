import { MetadataRoute } from "next";
import { SEED_CARS } from "@/lib/seedData";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://sheggarwheels.et";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cars`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/signin`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const carRoutes: MetadataRoute.Sitemap = SEED_CARS.filter(
    (c) => c.status === "approved"
  ).map((car) => ({
    url: `${baseUrl}/cars/${car.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...carRoutes];
}
