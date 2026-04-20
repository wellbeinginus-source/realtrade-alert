import type { MetadataRoute } from "next";

const BASE_URL = "https://realtrade-alert.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
