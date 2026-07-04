# CLAUDE.md — Western Dental Academy (WDA) Project

This file provides Claude Code with full persistent context for the WDA ecosystem. Read this entire file before making any changes to any part of the project.

---

## Project Overview

**Client:** Western Dental Academy (WDA)
**Website:** westerndentalacademy.com
**Location:** 150 Chippewa Road, Suite 258, Sherwood Park, AB
**Purpose:** Dental professional training institution — dental assisting programs, continuing education, hands-on clinical training.

**Developer:** Aiden Brost — aiden@westerndentalacademy.com
**Local project folder:** `C:\Users\brost\Desktop\Aiden\WDA\WDA Website\wda-website`
**GitHub org:** github.com/western-dental-academy
**Repo:** western-dental-academy/wda-website
**Deployment:** Vercel (WDA account, separate from Make One Productions)
**Git push command:** `git push origin HEAD`

---

## Ecosystem Architecture

The WDA platform is three separate but integrated systems:

```
westerndentalacademy.com        ← Public marketing website (Next.js / Vercel)
         ↕ Internal API routes
  WDA SIS (Student Info System)  ← Enrollment, records, payments (same Next.js app)
         ↕ REST API + LTI 1.3
       Moodle LMS               ← Course delivery (Docker locally / paid host in production)
               learn.westerndentalacademy.com
```

---

## Tech Stack

### Website & SIS
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **CMS:** Sanity (programs, team, blog, student records)
- **Auth:** Clerk — NOT YET INSTALLED
- **Payments:** Stripe — NOT YET INSTALLED
- **Fonts:** Montserrat (headings), Open Sans (body) via Google Fonts
- **Animations:** Framer Motion
- **Deployment:** Vercel
- **Domain registrar:** GoDaddy (.com), Vercel DNS (.ca → 301 redirect to .com)

### Moodle LMS
- **Platform:** Moodle 5.2.1 (open source, PHP/MySQL)
- **Local dev:** Docker Desktop
- **Production hosting:** TBD — Canadian data residency required (Alberta PIPA)
- **Subdomain:** learn.westerndentalacademy.com (production only)
- **Integration:** Moodle REST API + LTI 1.3

---

## Brand Identity

### Tagline
"Excellence in Dental Education. Innovation in Delivery. Commitment to Community."

### Supporting Statement
"Shaping the Future of Dental Excellence."

### Voice
Professional, warm, inspiring, accessible, community-driven. Always Canadian English.

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| Navy | `#0D3B6E` | Primary backgrounds, headings |
| Blue | `#378ADD` | Secondary, links, UI accents |
| Light Blue | `#4BA3E3` | Accent, highlight bands |
| Amber | `#E67E22` | CTA only — buttons, pills |
| White | `#FFFFFF` | Text on dark backgrounds |

Never use Amber for anything other than calls-to-action.

### Typography

| Use | Font | Weight |
|---|---|---|
| All headings | Montserrat | Bold (700) / SemiBold (600) |
| Body / captions | Open Sans | Regular (400) |

### Logo Files (in `/public/images/`)
- `WesternDentalAcademyLogo.png` — primary horizontal lockup (light backgrounds)
- `WesternDentalAcademyLogo-Inverted.png` — white version (dark/navy backgrounds)
- `WesternDentalAcademyLogo-NoText.png` — icon only
- `WesternDentalAcademyLogo-Inverted-NoText.png` — white icon only

### Favicon
`favicon.ico` and `apple-icon.png` live in `/app` (not `/public`) — Next.js App Router convention.

---

## Website Structure

### Pages Built
- `/` — Home
- `/about` — About WDA
- `/programs` — Programs listing
- `/programs/[slug]` — Individual program pages
- `/blog` — Blog listing (Sanity-driven)
- `/blog/[slug]` — Blog posts
- `/faq` — FAQ
- `/apply` — Multi-step application form (EXISTS — NOT yet connected to Sanity)
- `/book-a-tour` — Tour booking
- `/contact` — Contact + Google Maps embed
- `/edmonton-dental-careers` — Local SEO page
- `/privacy-policy`, `/terms-of-use`, `/accessibility` — Legal pages
- `/coming-soon` — Maintenance mode page
- `not-found.tsx` — Custom 404

### Maintenance Mode
```
MAINTENANCE_MODE=true
PREVIEW_KEY=wda2026   # Access full site at ?preview=wda2026
```
Middleware in `proxy.ts` handles routing. Studio access: `http://localhost:3000/studio?preview=wda2026`

---

## SEO & Metadata

Every page must export a `metadata` object.

```ts
export const metadata = {
  title: {
    default: 'Western Dental Academy | Dental Assistant Training Edmonton',
    template: '%s | Western Dental Academy',
  },
  description: 'Western Dental Academy trains the next generation of dental professionals through hands-on clinical training and modern curriculum in Edmonton, Alberta.',
  openGraph: {
    title: 'Western Dental Academy',
    description: 'Dental assistant training in Edmonton, Alberta.',
    url: 'https://westerndentalacademy.com',
    siteName: 'Western Dental Academy',
    images: [{ url: '/og-image.jpg' }],
    locale: 'en_CA',
    type: 'website',
  },
}
```

Target keywords: dental assistant training Edmonton, dental assisting program Alberta, dental academy Edmonton, become a dental assistant Edmonton.

---

## Google Analytics

```ts
import { GoogleAnalytics } from '@next/third-parties/google'
// <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
```

Env var: `NEXT_PUBLIC_GA_ID` — never hardcode.

---

## Sanity CMS

### Studio Access (local)
`http://localhost:3000/studio?preview=wda2026`

### Schema Types (all in `sanity/schemaTypes/`)
- `program` — WDA programs (add `moodleCourseId` field — number)
- `teamMember` — staff profiles
- `testimonial` — student quotes
- `blogPost` — blog articles (Portable Text)
- `faqItem` — FAQ entries
- `student` — student records ✓ BUILT

### Structure
Defined in `sanity/structure.ts` — all schema types must be added here to appear in studio sidebar.

### Student Schema Fields
- `firstName`, `lastName`, `email`, `phone`
- `status` — pending / accepted / rejected / enrolled / withdrawn (default: pending)
- `program` — reference to program document
- `moodleUserId` — number, readOnly, auto-populated on acceptance
- `clerkUserId` — string, readOnly, auto-populated on Clerk account creation
- `stripeCustomerId` — string, readOnly, auto-populated on Stripe customer creation
- `applicationDate`, `acceptedDate`
- `notes` — internal staff notes, not visible to student

---

## SIS — Student Information System

### Build Status
| Module | Status |
|---|---|
| Sanity student schema | ✓ Complete |
| Apply form UI (/apply) | ✓ Exists — NOT connected to Sanity |
| Apply form → Sanity API route | ✗ Not built |
| Clerk authentication | ✗ Not installed |
| Admin approval flow | ✗ Not built |
| Moodle provisioning on approval | ✗ Not built |
| Stripe payments | ✗ Not installed |

### Enrollment Flow (to be built)
```
Student submits /apply form
        ↓
/api/students/apply saves to Sanity (status: pending)
        ↓
Admin reviews in Sanity Studio → changes status to accepted
        ↓
Sanity webhook → /api/students/provision
        ↓
Create Clerk account → create Moodle user → store moodleUserId in Sanity
        ↓
Enroll in Moodle course based on program.moodleCourseId
        ↓
Send Stripe payment link
        ↓
Student pays → /api/webhooks/stripe → unlock course content
```

### Clerk (NOT YET INSTALLED)
- Install: `npm install @clerk/nextjs`
- Roles: `student`, `instructor`, `admin`, `finance`
- Role checks via `auth().sessionClaims` in server components and API routes

### Stripe (NOT YET INSTALLED)
- Use Stripe Checkout or Elements — never handle raw card data
- Webhook: `/api/webhooks/stripe` — always verify signatures
- WDA is a Ltd. corporation — register as "Company" in Stripe with CRA business number
- Store `stripeCustomerId` and `stripePaymentIntentId` on Sanity student documents

---

## Moodle LMS Integration

### Local Development
- **Docker folder:** `C:\Users\brost\Desktop\Aiden\WDA\moodle-local\`
- **Start:** `docker compose up -d`
- **Stop:** `docker compose stop`
- **Local URL:** `http://localhost:8080/moodle`
- **Admin:** username `admin` / password `Admin1234!`
- **Moodle version:** 5.2.1 — requires MySQL 8.4
- **APACHE_DOCUMENT_ROOT:** `/var/www/html/moodle/public` (Moodle 5.2 requirement)
- **config.php wwwroot:** `http://localhost:8080` (no /moodle suffix)
- **Moodledata:** `/var/moodledata`
- **Welcome email errors on enrollment:** safe to ignore locally (no mail server in Docker)

### Moodle Courses
| Course | Short Name | Moodle ID |
|---|---|---|
| Dental Assisting Certificate — Distance Delivery | DAC-DD | 2 |

### Moodle API Configuration
- Web services: enabled
- REST protocol: enabled
- External service: **WDA SIS** (authorised users only)
- Authorised user: admin (aiden@westerndentalacademy.com)
- Functions enabled:
  - `core_user_create_users`
  - `core_user_update_users`
  - `enrol_manual_enrol_users`
  - `core_completion_get_activities_completion_status`
  - `gradereport_user_get_grade_items`
  - `core_course_get_courses`

### Moodle API Client
**Location:** `lib/moodle/client.ts` ✓ BUILT AND TESTED

Exports:
- `moodleRequest(wsfunction, params)` — base request
- `createMoodleUser(user)` — create student in Moodle
- `updateMoodleUser(moodleUserId, fields)` — update/suspend user
- `enrolMoodleUser(moodleUserId, moodleCourseId, roleId?)` — enrol student (roleId 5 = student)
- `getMoodleProgress(moodleUserId, moodleCourseId)` — completion status
- `getMoodleGrades(moodleUserId, moodleCourseId)` — grade items
- `getMoodleCourses()` — list all courses

**Note:** `enrolMoodleUser` silently catches "Message was not sent" errors — enrollment succeeds despite this error in local Docker.

### Test Routes (dev only — remove before production)
- `GET /api/moodle/test` — lists all Moodle courses
- `GET /api/moodle/test-enroll` — creates test student and enrolls in DAC-DD

### SIS → Moodle Sync
| SIS Event | Moodle Action | API Route |
|---|---|---|
| Application approved | Create Moodle user | `/api/moodle/create-user` |
| Student enrolled | Enroll in course | `/api/moodle/enroll` |
| Payment confirmed | Unlock course content | `/api/moodle/activate` |
| Student withdrawn | Suspend account | `/api/moodle/suspend` |

### Moodle → SIS Sync
| Moodle Event | SIS Action |
|---|---|
| Module completed | Update progress in Sanity |
| Quiz grade recorded | Store in student transcript |
| Course completed | Generate PDF certificate |

### Production Migration (when ready)
1. Export Moodle backup (Site admin → Courses → Backups)
2. Sign up with paid Canadian host
3. Import backup to production instance
4. Add CNAME in GoDaddy: `learn` → host value
5. Generate new API token, update Vercel env vars

---

## API Routes Reference

| Route | Method | Status | Purpose |
|---|---|---|---|
| `/api/moodle/test` | GET | Dev only | List Moodle courses |
| `/api/moodle/test-enroll` | GET | Dev only | Test enrollment |
| `/api/students/apply` | POST | Not built | Save application to Sanity |
| `/api/students/provision` | POST | Not built | Full provisioning on acceptance |
| `/api/moodle/create-user` | POST | Not built | Provision student in Moodle |
| `/api/moodle/enroll` | POST | Not built | Enroll student in course |
| `/api/moodle/activate` | POST | Not built | Activate after payment |
| `/api/moodle/suspend` | POST | Not built | Suspend Moodle account |
| `/api/lti/launch` | POST | Not built | LTI 1.3 SSO to Moodle |
| `/api/webhooks/stripe` | POST | Not built | Stripe payment events |
| `/api/webhooks/moodle` | POST | Not built | Moodle completion events |

---

## Security & Compliance

### Alberta PIPA
All student data must stay on Canadian servers.
- Moodle host: DigitalOcean Toronto or MoodleCloud CA
- Third-party security review required before go-live with live PII and payments

### Security Practices
- Input validation: **Zod** on all API route inputs
- Security headers in `next.config.ts`
- Never hardcode secrets — `.env.local` + Vercel dashboard
- Verify all webhook signatures before processing
- Use LTI 1.3 (not deprecated LTI 1.1)

---

## Environment Variables (Full List)

```bash
# Analytics
NEXT_PUBLIC_GA_ID=

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=

# Clerk (not yet installed)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Stripe (not yet installed)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Moodle
MOODLE_URL=http://localhost:8080
MOODLE_TOKEN=
MOODLE_COURSE_DAC_DD=2

# Maintenance Mode
MAINTENANCE_MODE=true
PREVIEW_KEY=wda2026
```

---

## DNS Reference

| Record | Type | Value | Purpose |
|---|---|---|---|
| `@` | A | `76.76.21.21` | westerndentalacademy.com → Vercel |
| `www` | CNAME | `cname.vercel-dns.com` | www redirect |
| `.ca` nameservers | NS | `ns1/ns2.vercel-dns.com` | .ca → 301 to .com |
| `learn` | CNAME | `<moodle-host-value>` | Moodle subdomain (production) |
| MX records | MX | Microsoft 365 | Email |
| SPF / DKIM / DMARC | TXT | M365 values | Email authentication |

---

## Key Contacts

| Name | Role | Contact |
|---|---|---|
| Jolene | WDA Owner / Administrator | — |
| Lance | WDA Owner (funding decisions) | — |
| Tammy | WDA Staff | — |
| Aiden Brost | Digital Operations & Technology Coordinator | aiden@westerndentalacademy.com |

---

## Build Phases

| Phase | Scope | Status |
|---|---|---|
| 1 | Marketing website (all pages, Sanity, brand, SEO) | ✓ Complete |
| 2 | Sanity student schema | ✓ Complete |
| 3 | Moodle local Docker setup + REST API client | ✓ Complete |
| 4 | Connect /apply form → Sanity API route | Next |
| 5 | Clerk authentication install + setup | Planned |
| 6 | Admin approval flow → Moodle auto-provisioning | Planned |
| 7 | Stripe payments + webhook | Planned |
| 8 | Student portal — course dashboard, certificates | Planned |
| 9 | LTI 1.3 SSO | Planned |
| 10 | Production Moodle hosting + migration | Planned |