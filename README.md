# MAK & SONS CONSTRUCTION website

A responsive, bilingual (English and Urdu) static website built around the supplied brand logo, quotations and 24 real project photographs.

## Preview locally

Open a terminal in this folder and run a static server, for example:

```powershell
py -m http.server 8000
```

Then open `http://localhost:8000`. A local static server is recommended for browser module imports. Links and assets stay relative to this folder, so pages also work when the repository is hosted under a project path.

## Included pages and features

- Home page with an above-the-fold project enquiry CTA
- Services, pricing, projects, homes for sale, about and contact pages
- English/Urdu language switch with right-to-left Urdu layout
- 15 House 01 photographs and 9 House 02 photographs, compressed to WebP
- Public rates and quotation allowances, additional charges and exclusions
- Responsive navigation, mobile sticky CTA, project photo lightbox and loading/error states for the enquiry form
- Custom 404, thank-you, privacy policy and terms pages
- Open Graph sharing image, favicon, per-page title and meta description
- `GeneralContractor` structured data on the home page for local search results
- Consent banner gating both Vercel Web Analytics and Google Analytics 4
- Security response headers (CSP, nosniff, frame-ancestors, Referrer-Policy, HSTS) in `vercel.json`
- Staging `robots.txt` and sitemap placeholder

## Before launch

1. Deploy the static site to the chosen host. Vercel can assign a `https://your-project.vercel.app` address; confirm the selected plan permits a commercial business website.
2. After the final Vercel URL is assigned, run `node scripts/set-domain.mjs https://your-project.vercel.app` from this folder. The script sets canonical and Open Graph URLs, enables crawling, and writes an absolute-URL sitemap. Use the exact HTTPS origin assigned by the host.
3. Add the company’s Google Analytics 4 ID to `assets/js/site-config.js`. Analytics will load only after a visitor allows analytics.
4. Choose a form receiving service and add its JSON endpoint to `assets/js/site-config.js`. Until then, the form opens an email draft and clearly asks the visitor to send it.
5. Review the privacy policy and terms against the company’s real data, sales and contracting practices. Confirm rates, allowances and any quotation changes.
6. Confirm whether House 02 is still available before changing its listing copy. The site currently asks visitors to confirm availability.
7. Confirm all Urdu translations with the company before public launch.
8. Set up the chosen hosting provider’s 404 page using `404.html`.

## Site configuration

Edit `assets/js/site-config.js` to provide the real analytics measurement ID and form endpoint. Keep credentials and private keys out of this static project. The site does not publish a street address because the company asked to describe its service area as all of Lahore.

## Security and privacy notes

- `vercel.json` sets the security response headers. The Content-Security-Policy allowlist includes `d8j0ntlcm91z4.cloudfront.net` under `media-src` for the hero background videos. **If those video URLs ever change, update that entry or the backgrounds will be blocked.**
- Analytics are consent-gated in `loadAnalytics()` in `assets/js/site.js`. No analytics request is made before a visitor clicks “Allow analytics”. Do not add analytics `<script>` tags back into the page `<head>`.
- The contact form has a hidden `company-website` honeypot field. It is stripped from the payload before sending. **A receiving form service must still validate server-side and rate-limit** — the honeypot only stops naive bots.
- The quotation PDFs and the original `PXL_*` photographs at the repository root are served publicly at the site root, e.g. `/MAK%20&%20SONS%20Finishing%20Quotation%20(English).pdf`. `vercel.json` marks PDFs `noindex` so they stay out of search results, but anyone with the URL can still download them. Move them out of this folder if that is not intended. The camera originals may also still carry EXIF location data.

## Search visibility

- Structured data lives in the `application/ld+json` block in `index.html`. Keep the rates, phone numbers and social profiles there in step with the rest of the site, and re-test with Google's Rich Results Test after editing.
- After deploying, submit `sitemap.xml` in Google Search Console and create a Google Business Profile for the company — for a local contractor that profile drives far more “construction company in Lahore” traffic than on-page changes do.
