# YourERPCoach.com website

The marketing website for YECC (YourERPCoach). It is a static site built with [Astro](https://astro.build) 7 and Tailwind CSS v4. There is no backend and no database. The output is plain HTML, CSS and a little JavaScript that can be hosted anywhere.

The site has two audiences, each with its own menu. A tab under the logo switches between them:

- **For SIs** (Oracle System Integrators): EUTaaS, DOCaaS, Resource Augmentation, Consulting Training and SHERPA. All calls to action lead to the central Contact page.
- **For Consultants & Grads**: fresher training cohorts, self-paced courses, the mobile app and eCampus. Calls to action lead to the cohort inquiry form.

---

## Quick start

Requirements: Node.js 22 or later, and npm.

```bash
npm install
npm run dev       # http://localhost:4180, reloads as you edit
npm run build     # static site written to dist/
npm run preview   # serves dist/ at http://localhost:4180
```

---

## Tech stack

| Layer | What | Version |
| --- | --- | --- |
| Framework | [Astro](https://astro.build), static output (no server, no SSR adapter) | 7.3.5 |
| Bundler / dev server | Vite (bundled with Astro) | 8.x |
| Styling | [Tailwind CSS](https://tailwindcss.com) v4 via `@tailwindcss/vite`; design tokens in `@theme`, component styles in plain CSS in `src/styles/global.css` | 4.3.3 |
| Language | TypeScript for data and helpers (`src/lib`, `src/data`), `.astro` components, plain JavaScript in the browser (`src/scripts/site.js`, no framework) | Astro's base tsconfig |
| Fonts | Self-hosted via Fontsource: Newsreader (serif headings), Hanken Grotesk (body) | 5.3.0 |
| Images | `astro:assets` optimises images in `src/assets` at build time (WebP and resized) | built in |
| SEO | `@astrojs/sitemap` (sitemap-index.xml), generated `robots.txt`, canonical, Open Graph, Twitter and JSON-LD tags in `Layout.astro` | 3.7.4 |
| Icons | inline SVG paths in `src/lib/icons.ts`, no icon library | |
| Forms | Contact: JSON POST to an API you provide (mailto fallback until then). Cohort inquiry: posts to a Google Form | |
| Hosting (preview) | GitHub Pages, built and deployed by GitHub Actions (`.github/workflows/deploy.yml`, Node 22) | |
| Tooling | `tools/fetch_courses.py` (Python 3 + headless Google Chrome) refreshes course data from the old site | |
| Runtime requirements | Node.js 22+ and npm | |

No UI framework (React, Vue, etc.), no CMS, no database, no backend and no cookies. Content lives in the repo as `.astro` pages and `src/data/*.json` / `*.ts`.

---

## Handover checklist (what still needs connecting)

| # | Task | Where | Status |
| --- | --- | --- | --- |
| 1 | Contact form API (email to the YECC team) | `src/lib/contact.ts`, `CONTACT_ENDPOINT` | **Not connected.** For now the form opens the visitor's email app instead. |
| 2 | Google Tag / Google Tag Manager / analytics | `src/layouts/Layout.astro`, inside `<head>` | **Not added.** |
| 3 | Conversion events for the two forms | `src/scripts/site.js` | **Not added.** The success points are marked below. |
| 4 | Production domain and hosting | `SITE_URL` / `BASE_PATH` env vars | GitHub Pages preview only. |
| 5 | Cohort inquiry form to Google Form | `src/lib/cohort-form.ts` | **Working.** Do a live test submission and check the responses sheet. |
| 6 | Spam protection on forms (optional) | both forms | None yet. Turnstile or reCAPTCHA can go in with the contact API. |

### 1. Contact form API

The page is `src/pages/book-a-discussion.astro`, served at `/book-a-discussion/`. The form logic is in `src/scripts/site.js`, in the "Contact form" block.

Set `CONTACT_ENDPOINT` in `src/lib/contact.ts` to your API URL. The form then sends:

```http
POST <CONTACT_ENDPOINT>
Content-Type: application/json

{
  "subject": "End User Training (EUTaaS)",   // the "How can YECC help?" choice; use it as the email subject line
  "name": "…",
  "company": "…",
  "email": "…",
  "role": "…",
  "message": "…",
  "topic": "eutaas-standard",                // the ?topic= the visitor arrived with (see below)
  "page": "https://…/eutaas/"                // the page they came from (document.referrer)
}
```

- **Success:** any 2xx status. The page shows a thank-you message and returns to the home page after 8 seconds.
- **Failure:** any other status, or a network error. The page shows an error and keeps what the visitor typed.
- **CORS:** the request is a cross-origin JSON POST, so the endpoint must answer the `OPTIONS` preflight and allow the site's origin.
- **Validation:** validate and rate-limit on the server too. The browser only checks that the fields are required and that the email is well formed.
- **Fallback:** while `CONTACT_ENDPOINT` is `""`, submitting opens a `mailto:` to `sales@yecc.tech` (`EMAIL` in `src/lib/site.ts`) with everything filled in.

**How the topic is preselected.** Every SI-side button links to `contact("<topic>")`, which builds `/book-a-discussion/?topic=<topic>#contact-form`. The topic chooses the "How can YECC help?" option and fills in a starter message.

- Topics are listed in `TOPICS` in `src/lib/contact.ts`.
- The dropdown options and their starter messages are in `OPTIONS` in the same file.
- To add a topic, add it to `TOPICS` and link to `contact("your-topic")`.

### 2. Google Tag / GTM / analytics

Every page renders through one layout, `src/layouts/Layout.astro`. Paste the tag snippet once inside `<head>` and the `<noscript>` part, if any, straight after `<body>`. Use `is:inline` so Astro leaves the script untouched:

```astro
<!-- in <head> -->
<script is:inline async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
<script is:inline>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXX');
</script>
```

Keep the ID out of the code by reading it from an env var such as `import.meta.env.PUBLIC_GA_ID`, and only print the tag when it is set. That way local and preview builds don't send data. Add the variable to the build step in `.github/workflows/deploy.yml`, or to your host's settings.

The site sets no cookies of its own. If you add a consent banner, it goes in the same layout. The privacy policy is at `/termsconditions/#privacy-policy` (`src/content/legal/`).

### 3. Form conversion events

Both forms already have a single success point in `src/scripts/site.js`. Push your event there:

| Form | Page | Success point in `site.js` | Suggested event |
| --- | --- | --- | --- |
| Contact (SI side) | `/book-a-discussion/` | `finish(...)` call after `res.ok`; the mailto fallback also calls `finish` | `generate_lead` with `subject` and `topic` |
| Cohort inquiry (Consultants side) | `/cohort-inquiry/` | right after `await fetch(inquiry.action, …)` | `generate_lead` with the selected cohort |

Example: `window.dataLayer?.push({ event: "generate_lead", form: "contact", subject: d.subject, topic: d.topic });`

**Redirect timing.** After a successful send, both forms redirect after 8 seconds. That leaves time for tags to fire. If you shorten it, use GTM's `eventCallback`.

### 4. Hosting and domain

`astro.config.mjs` reads two environment variables at build time:

| Variable | Meaning | Example |
| --- | --- | --- |
| `SITE_URL` | Origin used for canonical URLs, Open Graph tags and the sitemap | `https://www.yourerpcoach.com` |
| `BASE_PATH` | Sub-path the site is served from. Leave unset on a real domain. | `/yecc-website` (GitHub Pages preview) |

Locally both are unset and the site runs at the root of `localhost:4180`.

**Building for a domain:**

```bash
SITE_URL=https://www.yourerpcoach.com npm run build
```

Then upload `dist/` to any static host: Cloudflare Pages, Netlify, Vercel, S3 with CloudFront, or nginx.

- URLs use trailing slashes (`/eutaas/`). Keep the host's default "directory index" behaviour.
- `robots.txt` and `sitemap-index.xml` are generated automatically.

**Current preview.** Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages at `https://yourerpcoach-com.github.io/yecc-website/`.

- The preview used to live under `/v2/`. The workflow writes a `404.html` that forwards old `/v1/…` and `/v2/…` links to the same page at the root.
- The repo used to be `urperfectdude/yecc-webpage`. That repo now only forwards old `urperfectdude.github.io/yecc-webpage/…` links to the same page here. Retire it once nobody uses those links.
- Drop that step once the site is on its own domain.

### 5. Cohort inquiry form (Google Form)

`/cohort-inquiry/` is a native form that posts straight to the "YECC Fresher Trainings - Leads" Google Form, so responses land in that form's responses sheet.

- **Config:** form ID, `entry.*` field IDs and option lists are in `src/lib/cohort-form.ts`.
- **Page and logic:** the page is `src/pages/cohort-inquiry.astro`. The logic is in the "Cohort inquiry form" block of `src/scripts/site.js`.
- **No reply to check.** It posts with `fetch(…, { mode: "no-cors" })`. Google never lets other sites read its reply, so a sent request counts as success. To confirm it works, submit once and check the sheet.
- **If the Google Form changes:** option text has to match it exactly, character for character. New `entry.*` IDs can be found in the form's page source.
- **Hidden answer.** The Google Form still requires "I have already gone through and understood the details". The site sends `Yes` in a hidden field. Remove that field only if the question is made optional or removed in Google.
- **Preselected cohort.** Buttons link to `cohortInquiry("oracle-hcm")`, which builds `/cohort-inquiry/?cohort=oracle-hcm#inquiry-form` and preselects the cohort.
- **WhatsApp number:** the country code defaults to `+91` and the number is digits only. A +91 number must be 10 digits starting 6 to 9. The code and number are sent joined: `+91 9876543210`.

**Later.** If you would rather send these to your own API too, mirror the contact form approach.

---

## Project structure

```
.github/workflows/deploy.yml   build and publish to GitHub Pages
astro.config.mjs               site/base from env, sitemap, Tailwind
public/                        files copied as-is (favicon.svg)
tools/fetch_courses.py         re-scrapes course data and artwork from the live www.yourerpcoach.com
src/
  layouts/Layout.astro         <head>, SEO and Open Graph tags, JSON-LD, header, footer, site.js
  styles/global.css            design tokens (@theme) and all component styles
  scripts/site.js              all client-side JavaScript (see below)
  lib/
    site.ts                    site facts (email, phone, socials, app links), menus, the to() link helper
    contact.ts                 Contact page: endpoint, "How can YECC help?" options, topics, contact()
    cohort-form.ts             Google Form IDs and options, cohortInquiry()
    icons.ts                   inline SVG icon paths used by <Icon name="…">
  components/                  reusable sections (Hero, Section, Head, Card, Cta, Btn, CohortCards, …)
  data/                        content that pages are generated from (see below)
  content/legal/               legal page bodies (HTML copied verbatim from the old site)
  assets/                      images; Astro optimises them at build time
  pages/                       one file per URL (see below)
```

### Pages

| URL | File | Audience |
| --- | --- | --- |
| `/` | `pages/index.astro` | SIs (home) |
| `/eutaas/` | `pages/eutaas.astro` | SIs |
| `/docaas/` | `pages/docaas.astro` | SIs |
| `/daas/` | `pages/daas.astro` | redirect to `/docaas/` (old URL), not in the sitemap |
| `/resource-augmentation/` | `pages/resource-augmentation.astro` | SIs |
| `/consulting-training/` | `pages/consulting-training.astro` | SIs |
| `/sherpa/` | `pages/sherpa.astro` | SIs |
| `/partnerships/`, `/about/` | `pages/partnerships.astro`, `pages/about.astro` | SIs |
| `/book-a-discussion/` | `pages/book-a-discussion.astro` | central Contact page (SIs) |
| `/consultants/` | `pages/consultants.astro` | Consultants (home) |
| `/upcoming-cohorts/` and `/upcoming-cohorts/<slug>/` | `pages/upcoming-cohorts/` | Consultants; one page per cohort in `data/cohorts.json` |
| `/courses/` and `/courses/<slug>/` | `pages/courses/` | Consultants; one page per course in `data/courses.json` |
| `/cohort-inquiry/` | `pages/cohort-inquiry.astro` | Consultants; posts to the Google Form |
| `/blogs/` and `/blogs/<slug>/` | `pages/blogs/` | one page per post in `data/blogs.json` |
| `/termsconditions/`, `/data-processing-agreement/` | `pages/…`, body in `content/legal/` | legal |
| `/robots.txt` | `pages/robots.txt.ts` | generated |

Files starting with `_` are not built. For example, `pages/_erpnext-implementation.astro` is a parked page. Rename it without the underscore to publish it.

A page belongs to the consultants side when its path starts with one of `CONSULTANT_PATHS` in `src/lib/site.ts`. That decides which menu and audience tab are shown and where the footer "Contact" link goes.

### Content data

| File | Drives |
| --- | --- |
| `data/cohorts.json` | cohort cards and cohort detail pages: start month, highlights, curriculum and module descriptions, delivery and schedule, supports, important notes |
| `data/modules.ts` | module chips and "Most suitable for" lists shared by the cohort cards and the Consulting Training tracks |
| `data/courses.json` | self-paced course pages; refresh with `python3 tools/fetch_courses.py` (needs Google Chrome) |
| `data/catalog.ts` | the self-paced course list and its filters on `/courses/`, and the course strip on `/consultants/` |
| `data/blogs.json` | blog posts; images are still hosted on the old site's DigitalOcean Spaces bucket |
| `data/about.json` | About page content |

### Client-side JavaScript (`src/scripts/site.js`)

One script, loaded on every page. Each block only runs when its elements are present on the page:

- the header audience tab hiding once you scroll past the hero
- the mobile menu
- accordions and FAQs
- SHERPA tabs, the testimonial scroller and the course strip
- the course catalog filters
- the contact form
- the cohort inquiry form

---

## Conventions

- **Internal links:** always build them with `to("/path")` from `src/lib/site.ts`. It adds the deploy base path and the trailing slash. A bare `"/path"` would break on the GitHub Pages preview.
- **Colours:** the logo's palette only. Tokens are in the `@theme` block of `src/styles/global.css`: blue `#2b72d9`, red `#e53935`, ink `#0d2344`, plus tints of the blue. Don't introduce new colours.
- **Copy:** no em dashes (use commas, colons or full stops). Product names are written EUTaaS, DOCaaS and SHERPA.
- **Tailwind:** component styles live in `global.css`, in the `components` layer. Avoid class names that clash with Tailwind utilities, such as `inline`, `hidden` or `flex`, when naming component classes.
- **Section spacing:** two adjacent sections with the same background collapse the gap between them automatically (rules in `global.css`). Don't add manual spacers.
- **Test:** check every change at phone width (about 375px) as well as desktop.

## Contacts and external links

These are all set in `src/lib/site.ts`:

- **Contact details:** sales email and phone.
- **Social links.**
- **External destinations:** the App Store and Play Store links, eCampus (`ecampus.yourerpcoach.com`), the learner login (`www.yourerpcoach.com`) and the SHERPA pitch video URL.
