# MAK & SONS CONSTRUCTION website

A responsive, bilingual (English and Urdu) static website built around the supplied brand logo, quotations and 24 real project photographs.

## Preview locally

Open a terminal in this folder and run a static server, for example:

```powershell
py -m http.server 8000
```

Then open `http://localhost:8000`. A static server is needed because the site uses root-relative asset paths.

## Included pages and features

- Home page with an above-the-fold project enquiry CTA
- Services, pricing, projects, homes for sale, about and contact pages
- English/Urdu language switch with right-to-left Urdu layout
- 15 House 01 photographs and 9 House 02 photographs, compressed to WebP
- Public rates and quotation allowances, additional charges and exclusions
- Responsive navigation, mobile sticky CTA, project photo lightbox and loading/error states for the enquiry form
- Custom 404, thank-you, privacy policy and terms pages
- Open Graph sharing image, favicon, per-page title and meta description
- Consent banner and consent-gated Google Analytics 4 integration
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
