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
- **Auth:** Clerk ✓ INSTALLED
- **Payments:** Stripe ✓ INSTALLED (test mode — awaiting business details to activate live)
- **Fonts:** Montserrat (headings), Open Sans (body) via Google Fonts
- **Animations:** Framer Motion
- **Deployment:** Vercel
- **Domain registrar:** GoDaddy (.com), Vercel DNS (.ca → 301 redirect to .com)

### Moodle LMS
- **Platform:** Moodle 5.2.1 (open source, PHP/MySQL)
- **Local dev:** Docker Desktop
- **Production hosting:** TBD — Canadian data residency required (Alberta PIPA)
- **Subdomain:** learn.westerndentalacademy.com (production only)
- **Integration:** Moodle REST API + LTI 1.3 (LTI deferred until production hosting)

---

## Organisation Structure

| Name | Title | Key Responsibilities |
|---|---|---|
| Lance Parker | Chief Executive Officer | Human Resources, Oversight |
| Ryan Zmurchuk | Chief Executive Officer | Finance and Procurement Officer, Oversight |
| Jolene Moore | Chief Operating Officer | Clinic Operations, Supplies and Equipment, Payroll/Benefits, Accounts Payable/Receivable, Student Enrollment, Program Approval Applications |
| Alana Welsh | Program Director | Program Lead, Faculty Director/Staff Concerns, Curriculum Development, LMS Management, Program Approval Applications |
| Collette Funk-Ross | Program Chair | Director of Academics, Student Liaison Officer, Dentally Lead, Curriculum Development, LMS Management |
| Tamara Parker | Instructor and Curriculum Design Specialist | Radiation Safety Officer, Social Media Moderator/Consultant, Curriculum Development, LMS Management |
| Aiden Brost | Digital Operations and Technology Coordinator | Social Media Development Strategist, Website Development/Maintenance, IT Support and Maintenance, Software Development |

**Decision makers for tech/software approvals:** Lance Parker, Ryan Zmurchuk, Jolene Moore
**LMS content owners:** Alana Welsh, Collette Funk-Ross, Tamara Parker
**Student enrollment:** Jolene Moore

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

### Logo Files (in `/public/`)
- `WesternDentalAcademyLogo-Alternate.svg` — alternate stacked logo (light backgrounds)
- `WesternDentalAcademyLogo-Alternate-Inverted.svg` — alternate stacked logo (dark/navy backgrounds)
- Original PNG logos also in `/public/` for other uses

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
- `/apply` — Multi-step application form ✓ Connected to Sanity
- `/book-a-tour` — Tour booking
- `/contact` — Contact + Google Maps embed
- `/edmonton-dental-careers` — Local SEO page
- `/privacy-policy`, `/terms-of-use`, `/accessibility` — Legal pages
- `/coming-soon` — Maintenance mode page
- `/portal` — Student portal ✓ BUILT (protected by Clerk)
- `/sign-in` — Clerk sign-in page (student login goes here — NOT D2L)
- `/sign-up` — Clerk sign-up page
- `not-found.tsx` — Custom 404

### Maintenance Mode
```
MAINTENANCE_MODE=true
PREVIEW_KEY=wda2026   # Access full site at ?preview=wda2026
```
Middleware in `proxy.ts` handles routing + Clerk auth.
Studio access: `http://localhost:3000/studio?preview=wda2026`

---

## Middleware (proxy.ts)

The project uses `proxy.ts` (not `middleware.ts`) — Next.js 16 convention.
Clerk is integrated directly into `proxy.ts` using `clerkMiddleware`.

Protected routes:
- `/portal(.*)` — requires Clerk authentication
- `/api/students/provision(.*)` — requires Clerk authentication

Public routes: everything else (marketing pages, apply form, sign-in/sign-up).

---

## Sanity CMS

### Studio Access (local)
`http://localhost:3000/studio?preview=wda2026`

### Schema Types (all in `sanity/schemaTypes/`)
- `program` — WDA programs (includes `moodleCourseId` number field)
- `teamMember` — staff profiles
- `testimonial` — student quotes
- `blogPost` — blog articles (Portable Text)
- `faqItem` — FAQ entries
- `student` — student records ✓ BUILT

### Student Schema Fields
- `firstName`, `lastName`, `email`, `phone`
- `status` — pending / accepted / rejected / enrolled / withdrawn (default: pending)
- `program` — reference to program document
- `moodleUserId` — number, readOnly, auto-populated on acceptance
- `clerkUserId` — string, readOnly, auto-populated on first portal visit
- `stripeCustomerId` — string, readOnly, auto-populated on Stripe customer creation
- `stripePaymentIntentId` — string, readOnly, auto-populated on payment
- `paymentStatus` — unpaid / pending / paid / refunded (default: unpaid)
- `tuitionAmount` — number in CAD dollars (set by admin)
- `applicationDate`, `acceptedDate`
- `notes` — internal staff notes, not visible to student

### Sanity API Token
Must be **Editor** role (read + write) — a read-only token will cause API route failures.

### Sanity Webhook
- **Local URL:** `https://<ngrok-url>/api/webhooks/sanity`
- **Production URL:** `https://westerndentalacademy.com/api/webhooks/sanity`
- **Secret:** `SANITY_WEBHOOK_SECRET=wda-sanity-webhook-2026`
- **Trigger:** Update on `student` documents
- **Filter:** `_type == "student"`
- **Logic:** Only acts when `status === 'accepted'`
- **Note:** ngrok URL changes on each restart — update at sanity.io/manage each session

---

## SIS — Student Information System

### Build Status
| Module | Status |
|---|---|
| Sanity student schema | ✓ Complete |
| Apply form → Sanity | ✓ Complete |
| Clerk authentication | ✓ Complete |
| Sanity webhook → Moodle provisioning | ✓ Complete |
| Clerk ↔ Sanity student linking | ✓ Complete |
| Student portal (/portal) | ✓ Complete |
| Progress & grade tracking | ✓ Complete |
| Certificate generation (PDF) | ✓ Complete |
| Stripe payments (test mode) | ✓ Complete |
| Stripe webhook → payment status | ✓ Complete |
| LTI 1.3 SSO | ✗ Deferred until production Moodle |

### Enrollment Flow (WORKING)
```
Student submits /apply form
        ↓
/api/students/apply saves to Sanity (status: pending)
        ↓
Jolene (COO) changes status to "accepted" in Sanity Studio → Publish
        ↓
Sanity webhook → /api/webhooks/sanity
        ↓
Create Moodle user → Enrol in course → Store moodleUserId in Sanity
        ↓
Student logs into portal → Clerk ID linked to Sanity record
        ↓
Student pays tuition via Stripe Checkout
        ↓
Stripe webhook → /api/webhooks/stripe → paymentStatus set to "paid"
        ↓
Portal shows progress, grades, profile, certificate when complete
```

### Clerk Authentication ✓
- Package: `@clerk/nextjs`
- `ClerkProvider` wraps body in `app/layout.tsx`
- `auth()` and `currentUser()` are async — always await them
- Never expose `CLERK_SECRET_KEY` in client code

### Stripe Payments ✓ (test mode)
- Package: `stripe`, `@stripe/stripe-js`
- Client: `lib/stripe/client.ts` — uses `apiVersion: '2026-06-24.dahlia'`
- Checkout route: `POST /api/stripe/checkout` — creates Stripe Checkout session
- Webhook route: `POST /api/webhooks/stripe` — handles `checkout.session.completed`
- Currency: CAD
- Test card: `4242 4242 4242 4242`, any future expiry, any CVC
- Local webhook testing: `C:\stripe\stripe.exe listen --forward-to localhost:3000/api/webhooks/stripe`
- `STRIPE_WEBHOOK_SECRET` from CLI is for local only — production will have a different secret from Stripe dashboard

### To activate Stripe live payments, need from Lance/Jolene:
- Legal business name exactly as on incorporation certificate
- CRA Business Number (9-digit BN)
- Registered business address
- Business bank account details
- Beneficial owner (25%+) — full legal name, DOB, home address, last 4 digits of SIN

### Certificate Generation ✓
- Package: `@react-pdf/renderer`
- Generator: `lib/certificate/generate.tsx`
- API route: `GET /api/students/certificate`
- Only available when all Moodle modules complete (100%)
- Downloads as `WDA-Certificate-[FirstName]-[LastName].pdf`

---

## Moodle LMS Integration

### Local Development
- **Docker folder:** `C:\Users\brost\Desktop\Aiden\WDA\moodle-local\`
- **Start:** `docker compose up -d`
- **Stop:** `docker compose stop`
- **Local URL:** `http://localhost:8080`
- **Admin:** username `admin` / password `Admin1234!`
- **Moodle version:** 5.2.1 — requires MySQL 8.4
- **APACHE_DOCUMENT_ROOT:** `/var/www/html/moodle/public`
- **config.php wwwroot:** `http://localhost:8080`
- **Welcome email errors on enrollment:** safe to ignore locally

### Moodle Courses
| Course | Short Name | Moodle ID |
|---|---|---|
| Dental Assisting Certificate — Distance Delivery | DAC-DD | 2 |

### Moodle API Configuration
- Web services: enabled
- REST protocol: enabled
- External service: **WDA SIS** (authorised users only)
- Functions enabled:
  - `core_user_create_users`
  - `core_user_update_users`
  - `enrol_manual_enrol_users`
  - `core_completion_get_activities_completion_status`
  - `gradereport_user_get_grade_items`
  - `core_course_get_courses`
  - `core_course_get_contents`

### Moodle API Client
**Location:** `lib/moodle/client.ts` ✓

Exports:
- `moodleRequest(wsfunction, params)` — base request
- `createMoodleUser(user)` — create student in Moodle
- `updateMoodleUser(moodleUserId, fields)` — update/suspend user
- `enrolMoodleUser(moodleUserId, moodleCourseId, roleId?)` — enrol student
- `getMoodleProgress(moodleUserId, moodleCourseId)` — completion status
- `getMoodleGrades(moodleUserId, moodleCourseId)` — grade items
- `getMoodleCourses()` — list all courses
- `getMoodleCourseContents(moodleCourseId)` — get modules with names

---

## Student Portal (/portal)

### Features Built
- Protected by Clerk
- Links Clerk user to Sanity student record on every visit
- Status-based UI: no record / pending / accepted / enrolled
- Tuition payment card with Stripe Checkout
- Course progress bar with percentage
- Module completion list with real activity names
- Grade display from Moodle
- Student profile section
- Certificate download at 100% completion
- Go to Moodle course button

### Portal Components
- `app/portal/page.tsx` — main portal server component
- `app/portal/layout.tsx` — auth check + Clerk linking
- `components/PayTuitionButton.tsx` — client component for Stripe checkout

---

## API Routes Reference

| Route | Method | Status | Purpose |
|---|---|---|---|
| `/api/students/apply` | POST | ✓ | Save application to Sanity |
| `/api/students/link-clerk` | POST | ✓ | Link Clerk ID to Sanity student |
| `/api/students/certificate` | GET | ✓ | Generate PDF certificate |
| `/api/stripe/checkout` | POST | ✓ | Create Stripe Checkout session |
| `/api/webhooks/sanity` | POST | ✓ | Moodle provisioning on acceptance |
| `/api/webhooks/stripe` | POST | ✓ | Update payment status on completion |
| `/api/moodle/test` | GET | Dev only | List Moodle courses |
| `/api/moodle/test-enroll` | GET | Dev only | Test enrollment |
| `/api/lti/launch` | POST | Not built | LTI 1.3 SSO (deferred) |

---

## Security & Compliance

### Alberta PIPA
All student data must stay on Canadian servers.
- Moodle host: DigitalOcean Toronto or MoodleCloud CA
- Third-party security review required before go-live

### Security Practices
- Input validation: **Zod** on all API route inputs
- Never hardcode secrets — `.env.local` + Vercel dashboard
- Verify all webhook signatures (`@sanity/webhook`, Stripe)
- `CLERK_SECRET_KEY` and `STRIPE_SECRET_KEY` server-side only
- `SANITY_API_TOKEN` must be Editor role

---

## Environment Variables (Full List)

```bash
# Analytics
NEXT_PUBLIC_GA_ID=

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=          # Must be Editor role

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=   # pk_test_... (pk_live_... when activated)
STRIPE_SECRET_KEY=                     # sk_test_... (sk_live_... when activated)
STRIPE_WEBHOOK_SECRET=                 # whsec_... (different for local vs production)

# Moodle
MOODLE_URL=http://localhost:8080       # https://learn.westerndentalacademy.com in production
MOODLE_TOKEN=
MOODLE_COURSE_DAC_DD=2

# Sanity Webhook
SANITY_WEBHOOK_SECRET=wda-sanity-webhook-2026

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # https://westerndentalacademy.com in production

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
| MX / SPF / DKIM / DMARC | — | Microsoft 365 values | Email |

---

## Build Phases

| Phase | Scope | Status |
|---|---|---|
| 1 | Marketing website (all pages, Sanity, brand, SEO) | ✓ Complete |
| 2 | Sanity student schema | ✓ Complete |
| 3 | Moodle local Docker setup + REST API client | ✓ Complete |
| 4 | Connect /apply form → Sanity API route | ✓ Complete |
| 5 | Clerk authentication | ✓ Complete |
| 6 | Sanity webhook → Moodle auto-provisioning | ✓ Complete |
| 7 | Student portal — progress, grades, profile, certificates | ✓ Complete |
| 8 | Stripe payments (test mode) | ✓ Complete |
| 9 | Activate Stripe live + production Moodle hosting | Waiting on business details |
| 10 | LTI 1.3 SSO | After production Moodle |
| 11 | Go live — flip maintenance mode off | Final step |

## Go-Live Checklist
- [ ] Stripe business details from Lance/Jolene → activate live payments
- [ ] Update `STRIPE_WEBHOOK_SECRET` in Vercel to production webhook secret
- [ ] Set up production Moodle on Canadian host
- [ ] Update `MOODLE_URL` in Vercel to production URL
- [ ] Update `MOODLE_TOKEN` in Vercel to production token
- [ ] Update Sanity webhook URL from ngrok to `https://westerndentalacademy.com/api/webhooks/sanity`
- [ ] Update `NEXT_PUBLIC_SITE_URL` in Vercel to `https://westerndentalacademy.com`
- [ ] Set `MAINTENANCE_MODE=false` in Vercel
- [ ] Third-party security review
- [ ] Test full enrollment flow on production