import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

export const runtime = "nodejs"; // 🔑 REQUIRED

const baseUrl = "https://genpire.com";

// Helper to get directories from a path
function getDirectories(dirPath: string) {
  try {
    const fullPath = path.join(process.cwd(), "app", dirPath);
    if (!fs.existsSync(fullPath)) return [];
    return fs
      .readdirSync(fullPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
    return [];
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Static Routes
  const routes = [
    "",
    "/about",
    "/faq",
    "/pricing",
    "/guide",
    "/terms",
    "/privacy",
    "/hire-tech-pack-designer",
    "/blog",
    "/suppliers",
    "/what-is-a-tech-pack",
    "/create-tech-pack-online",
    "/tech-pack-template",
    "/best-tech-pack-software",
    "/product-idea-generator",
    "/prototype-manufacturer-guide",
    "/sample-making-services",
    "/rapid-prototyping-accessories-home",
    "/ai-product-design-tools",
    "/how-to-find-a-manufacturer",
    "/low-moq-manufacturers",
    "/small-batch-manufacturing-guide",
    "/sustainable-manufacturing-options",
    "/clothing-manufacturers",
    "/custom-product-design-services",
    "/order-product-prototype",
    "/3d-printing-services",
    "/card-design-services",
    "/design-for-manufacturing",
    "/design-to-production",
    "/end-to-end-solutions",
    "/industrial-design",
    "/manufacturing-consultation",
    "/product-design-services",
    "/manufacturing-partners",
    "/market-research",
    "/product-development",
    "/product-launch-support",
    "/product-planning",
    "/quality-control",
    "/rapid-prototyping",
    "/supply-chain-management",
    "/vendor-management",
    "/reset-password",
    "/industry",
    "/friends",
    "/share",
    "/discover",
    "/enterprise",
    "/announcements",
    "/p", // Public product view pages
    "/showcase"
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Blog Routes
  const blogPosts = getDirectories("blog");
  const blogRoutes = blogPosts.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Industry Routes
  const industries = getDirectories("industry");
  const industryRoutes = industries.map((slug) => ({
    url: `${baseUrl}/industry/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...routes, ...blogRoutes, ...industryRoutes];
}
