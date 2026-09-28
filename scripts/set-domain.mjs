import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const raw = process.argv[2];
if (!raw) {
  console.error("Usage: node scripts/set-domain.mjs https://your-project.vercel.app");
  process.exit(1);
}

let domain;
try { domain = new URL(raw); } catch {
  console.error("Please provide a complete https:// domain URL.");
  process.exit(1);
}
if (domain.protocol !== "https:" || domain.pathname !== "/" || domain.search || domain.hash || domain.username || domain.password) {
  console.error("Use the deployment origin only, for example https://your-project.vercel.app");
  process.exit(1);
}
const origin = domain.origin;
const pages = ["index.html", "services.html", "projects.html", "pricing.html", "about.html", "contact.html", "privacy.html", "terms.html"];

for (const file of pages) {
  const fullPath = path.join(root, file);
  let html = fs.readFileSync(fullPath, "utf8");
  const canonicalPath = file === "index.html" ? "/" : `/${file}`;
  const canonical = `${origin}${canonicalPath}`;
  const ogImage = `${origin}/assets/images/og-share.jpg`;
  const canonicalTag = `<link rel="canonical" href="${canonical}">`;
  if (/<link rel="canonical"[^>]*>/i.test(html)) html = html.replace(/<link rel="canonical"[^>]*>/i, canonicalTag);
  else html = html.replace(/<meta name="theme-color"[^>]*>/i, `$&\n  ${canonicalTag}`);
  html = html.replace(/<meta property="og:image" content="[^"]*">/i, `<meta property="og:image" content="${ogImage}">`);
  if (/<meta property="og:url"[^>]*>/i.test(html)) html = html.replace(/<meta property="og:url"[^>]*>/i, `<meta property="og:url" content="${canonical}">`);
  else html = html.replace(/<meta property="og:type"[^>]*>/i, `$&<meta property="og:url" content="${canonical}">`);
  fs.writeFileSync(fullPath, html, "utf8");
}

const configPath = path.join(root, "assets", "js", "site-config.js");
let config = fs.readFileSync(configPath, "utf8");
config = config.replace(/origin:\s*"[^"]*"/, `origin: "${origin}"`);
fs.writeFileSync(configPath, config, "utf8");

fs.writeFileSync(path.join(root, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`, "utf8");
const today = new Date().toISOString().slice(0, 10);
const urls = pages.map(file => {
  const loc = file === "index.html" ? `${origin}/` : `${origin}/${file}`;
  return `  <url><loc>${loc}</loc><lastmod>${today}</lastmod></url>`;
}).join("\n");
fs.writeFileSync(path.join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, "utf8");
console.log(`Configured canonical URLs, Open Graph URLs, robots.txt and sitemap.xml for ${origin}`);
