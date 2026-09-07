import { rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const distDir = resolve("dist");
const rawSiteUrl = process.env.VITE_SITE_URL?.trim();

const normalizeOrigin = (value) => {
  if (!value) return null;

  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("VITE_SITE_URL must use http or https.");
  }

  return url.origin;
};

const siteUrl = normalizeOrigin(rawSiteUrl);
const robotsPath = resolve(distDir, "robots.txt");
const sitemapPath = resolve(distDir, "sitemap.xml");

if (!siteUrl) {
  await writeFile(robotsPath, "User-agent: *\nAllow: /\n", "utf8");
  await rm(sitemapPath, { force: true });
  console.warn("VITE_SITE_URL is not set; sitemap generation was skipped.");
  process.exit(0);
}

const publicRoutes = ["/", "/properties", "/properties/all", "/about", "/contact"];
const sitemapEntries = publicRoutes
  .map((route) => `  <url>\n    <loc>${siteUrl}${route}</loc>\n  </url>`)
  .join("\n");

await writeFile(
  robotsPath,
  `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
  "utf8",
);
await writeFile(
  sitemapPath,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`,
  "utf8",
);
