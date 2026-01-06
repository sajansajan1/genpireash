import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/creator-dashboard/", "/supplier-dashboard/"],
    },
    sitemap: "https://genpire.com/sitemap.xml",
  }
}
