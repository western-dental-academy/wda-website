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
**GitHub org:** github.com/western-dental-academy (private repo)
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
- **CMS:** Sanity (programs, team, blog, student records, subscribers)
- **Auth:** Clerk ✓ INSTALLED
- **Payments:** Stripe ✓ INSTALLED (test mode — awaiting business details to activate live)
- **PDF Generation:** @react-pdf/renderer
- **Rate Limiting:** @upstash/ratelimit + @upstash/redis (Upstash Redis)
- **Bot Protection:** react-google-recaptcha-v3 (reCAPTCHA v3)
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
Professional, warm, inspiring, accessible, community-driven. Always Canadian English (programme, colour, centre, etc.).

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
- `WesternDentalAcademyLogo-Alternate.svg` — stacked logo, cropped tight (light backgrounds)
- `WesternDentalAcademyLogo-Alternate-Inverted.svg` — stacked logo, cropped tight (dark/navy backgrounds)
- Original PNG logos also in `/public/` for other uses
- Navbar and footer use the alternate SVG versions

### Favicon
`favicon.ico` and `apple-icon.png` live in `/app` (not `/public`) — Next.js App Router convention.

---

## Website Structure

### Pages Built
- `/` — Home (includes newsletter signup)
- `/about` — About WDA (team members pulled from Sanity)
- `/programs` — Programs listing
- `/programs/[slug]` — Individual program pages
- `/blog` — Blog listing (Sanity-driven)
- `/blog/[slug]` — Blog posts
- `/faq` — FAQ
- `/apply` — Multi-step application form ✓ Connected to Sanity + reCAPTCHA
- `/book-a-tour` — Tour booking
- `/contact` — Contact + Google Maps embed
- `/edmonton-dental-careers` — Local SEO page
- `/privacy-policy`, `/terms-of-use`, `/accessibility` — Legal pages
- `/coming-soon` — Maintenance mode page
- `/portal` — Student portal ✓ BUILT (protected by Clerk)
- `/sign-in` — Clerk sign-in page (student login — NOT D2L)
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
Clerk is integrated via `clerkMiddleware`.

**Critical:** API routes must be passed through BEFORE the Clerk handler runs:

```typescript
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // API routes pass through first — before Clerk
  if (pathname.startsWith('/api') || pathname.startsWith('/__clerk') || ...) {
    return NextResponse.next()
  }

  // Clerk runs on non-API routes only
  const clerkResponse = await clerkHandler(request, {} as any)
  if (clerkResponse) return clerkResponse
  // ... maintenance mode logic
}
```

Protected routes (Clerk auth required):
- `/portal(.*)`
- `/api/students/provision(.*)`

---

## Sanity CMS

### Studio Access (local)
`http://localhost:3000/studio?preview=wda2026`

### Schema Types (all in `sanity/schemaTypes/`)
- `program` — WDA programmes (includes `moodleCourseId` number field)
- `teamMember` — staff profiles (photo support via @sanity/image-url)
- `testimonial` — student quotes
- `blogPost` — blog articles (Portable Text)
- `faqItem` — FAQ entries
- `student` — student records ✓
- `subscriber` — newsletter subscribers ✓

### Student Schema Fields
- `firstName`, `lastName`, `email`, `phone`
- `status` — pending / accepted / rejected / enrolled / withdrawn (default: pending)
- `program` — reference to program document
- `moodleUserId` — number, readOnly, auto-populated on acceptance
- `clerkUserId` — string, readOnly, auto-populated on first portal visit
- `stripeCustomerId` — string, readOnly
- `stripePaymentIntentId` — string, readOnly
- `paymentStatus` — unpaid / pending / paid / refunded (default: unpaid)
- `tuitionAmount` — number in CAD dollars (set by admin in Studio)
- `applicationDate`, `acceptedDate`
- `notes` — internal staff notes

### Sanity API Token
Must be **Editor** role (read + write) — read-only token will fail on all write operations.

### Sanity Webhook
- **Local URL:** `https://<ngrok-url>/api/webhooks/sanity`
- **Production URL:** `https://westerndentalacademy.com/api/webhooks/sanity`
- **Secret:** `SANITY_WEBHOOK_SECRET=wda-sanity-webhook-2026`
- **Trigger:** Update on `student` documents where `_type == "student"`
- **Logic:** Only acts when `status === 'accepted'`
- **Note:** ngrok URL changes on each restart — update at sanity.io/manage each session

---

## SIS — Student Information System

### Build Status
| Module | Status |
|---|---|
| Sanity student schema | ✓ Complete |
| Apply form → Sanity | ✓ Complete |
| reCAPTCHA v3 on apply form | ✓ Complete |
| Rate limiting on apply + subscribe | ✓ Complete |
| Clerk authentication | ✓ Complete |
| Sanity webhook → Moodle provisioning | ✓ Complete |
| Clerk ↔ Sanity student linking | ✓ Complete |
| Student portal (/portal) | ✓ Complete |
| Progress & grade tracking | ✓ Complete |
| Certificate generation (PDF) | ✓ Complete |
| Stripe payments (test mode) | ✓ Complete |
| Stripe webhook → payment status | ✓ Complete |
| Newsletter subscription → Sanity | ✓ Complete |
| Team members on About page from Sanity | ✓ Complete |
| LTI 1.3 SSO | ✗ Deferred until production Moodle |

### Enrollment Flow (WORKING)
```
Student submits /apply form (reCAPTCHA verified)
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

### reCAPTCHA v3
- Package: `react-google-recaptcha-v3`
- Provider: `components/RecaptchaProvider.tsx` (client component wrapping layout)
- Hook: `useGoogleReCaptcha` in `components/ApplyForm.tsx`
- Verification: server-side in `/api/students/apply/route.ts`
- **Only enforced in production** (`NODE_ENV === 'production'`) — skipped locally to avoid localhost scoring issues
- Score threshold: 0.5

### Rate Limiting
- Package: `@upstash/ratelimit` + `@upstash/redis`
- Client: `lib/ratelimit.ts`
- Apply form: 5 requests per 10 minutes per IP
- Subscribe form: 3 requests per 10 minutes per IP
- Returns 429 with user-friendly message

### Clerk Authentication ✓
- Package: `@clerk/nextjs`
- `ClerkProvider` wraps body in `app/layout.tsx`
- `auth()` and `currentUser()` are async — always await them
- Never expose `CLERK_SECRET_KEY` in client code

### Stripe Payments ✓ (test mode)
- Package: `stripe`, `@stripe/stripe-js`
- Client: `lib/stripe/client.ts` — uses `apiVersion: '2026-06-24.dahlia'`
- Checkout route: `POST /api/stripe/checkout`
- Webhook route: `POST /api/webhooks/stripe`
- Currency: CAD
- Test card: `4242 4242 4242 4242`, any future expiry, any CVC
- Local webhook testing: `C:\stripe\stripe.exe listen --forward-to localhost:3000/api/webhooks/stripe`

### Certificate Generation ✓
- Package: `@react-pdf/renderer`
- Generator: `lib/certificate/generate.tsx`
- API route: `GET /api/students/certificate`
- Only available when all Moodle modules complete (100%)

### Newsletter Subscription ✓
- API route: `POST /api/subscribe`
- Rate limited: 3 requests per 10 minutes per IP
- Saves to Sanity `subscriber` document type
- Viewable in Sanity Studio under Subscribers

---

## Moodle LMS Integration

### Local Development
- **Docker folder:** `C:\Users\brost\Desktop\Aiden\WDA\moodle-local\`
- **Start:** `docker compose up -d`
- **Stop:** `docker compose stop`
- **Local URL:** `http://localhost:8080`
- **Admin password:** Changed from default — check password manager
- **Moodle version:** 5.2.1 — requires MySQL 8.4
- **APACHE_DOCUMENT_ROOT:** `/var/www/html/moodle/public`
- **config.php wwwroot:** `http://localhost:8080`

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

## About Page — Team Members

- Team members are pulled dynamically from Sanity Studio
- Schema: `teamMember` — name, role, bio, photo, order
- Photo support via `@sanity/image-url` — utility at `lib/sanity/image.ts`
- TeamCard component: `components/TeamCard.tsx` (client component with read more toggle)
- Photos use `urlFor(photo).width(600).height(320).fit('crop').url()`
- Display order: lower numbers appear first — set in Sanity Studio

---

## Student Portal (/portal)

### Features Built
- Protected by Clerk
- Links Clerk user to Sanity student record on every visit
- Status-based UI: no record / pending / accepted / enrolled
- Tuition payment card with Stripe Checkout
- Course progress bar with percentage
- Module completion list with real activity names from Moodle
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
| `/api/students/apply` | POST | ✓ | Save application to Sanity (rate limited + reCAPTCHA) |
| `/api/students/link-clerk` | POST | ✓ | Link Clerk ID to Sanity student |
| `/api/students/certificate` | GET | ✓ | Generate PDF certificate |
| `/api/stripe/checkout` | POST | ✓ | Create Stripe Checkout session |
| `/api/subscribe` | POST | ✓ | Save newsletter subscriber (rate limited) |
| `/api/webhooks/sanity` | POST | ✓ | Moodle provisioning on acceptance |
| `/api/webhooks/stripe` | POST | ✓ | Update payment status on completion |
| `/api/moodle/test` | GET | Dev only | List Moodle courses |
| `/api/moodle/test-enroll` | GET | Dev only | Test enrollment |
| `/api/lti/launch` | POST | Not built | LTI 1.3 SSO (deferred) |

---

## Security Implementation

### Completed
- ✓ Rate limiting on apply and subscribe routes (Upstash Redis)
- ✓ reCAPTCHA v3 on apply form (production only)
- ✓ Clerk authentication on portal routes
- ✓ Stripe webhook signature verification
- ✓ Sanity webhook signature verification
- ✓ GitHub repo set to private
- ✓ Moodle admin password changed from default
- ✓ API routes pass through before Clerk handler

### Still To Do Before Go-Live
- [ ] Add reCAPTCHA to newsletter subscribe form
- [ ] Zod input validation on all API routes
- [ ] Security headers in `next.config.ts`
- [ ] Third-party security review
- [ ] PIPA compliance documentation

---

## Local Development — What to Run

1. **Dev server** (VS Code terminal): `npm run dev`
2. **Moodle** (PowerShell): `cd C:\Users\brost\Desktop\Aiden\WDA\moodle-local && docker compose up -d`
3. **Stripe CLI** (PowerShell admin): `C:\stripe\stripe.exe listen --forward-to localhost:3000/api/webhooks/stripe`
4. **ngrok** (only for Sanity webhook testing): `ngrok http 3000` then update webhook URL at sanity.io/manage

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

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=

# Upstash Rate Limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

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
| 9 | Newsletter subscription → Sanity | ✓ Complete |
| 10 | Team members on About page from Sanity | ✓ Complete |
| 11 | Security hardening (rate limiting, reCAPTCHA, private repo) | ✓ Complete |
| 12 | Activate Stripe live + production Moodle hosting | Waiting on business details |
| 13 | LTI 1.3 SSO | After production Moodle |
| 14 | Go live — flip maintenance mode off | Final step |

---

## Go-Live Checklist
- [ ] Stripe business details from Lance/Jolene → activate live payments
- [ ] Update `STRIPE_WEBHOOK_SECRET` in Vercel to production webhook secret
- [ ] Add production Stripe webhook in Stripe dashboard → `https://westerndentalacademy.com/api/webhooks/stripe`
- [ ] Switch Stripe from test keys to live keys in Vercel
- [ ] Set up production Moodle on Canadian host (DigitalOcean Toronto or MoodleCloud CA)
- [ ] Export local Moodle backup and import to production
- [ ] Add CNAME in GoDaddy: `learn` → production host value
- [ ] Update `MOODLE_URL` in Vercel to `https://learn.westerndentalacademy.com`
- [ ] Update `MOODLE_TOKEN` in Vercel to production token
- [ ] Update Sanity webhook URL from ngrok to `https://westerndentalacademy.com/api/webhooks/sanity`
- [ ] Update `NEXT_PUBLIC_SITE_URL` in Vercel to `https://westerndentalacademy.com`
- [ ] Set `MAINTENANCE_MODE=false` in Vercel
- [ ] Change Moodle admin password on production instance
- [ ] Third-party security review
- [ ] Test full enrollment flow on production
- [ ] Confirm westerndentalacademy.com loads correctly