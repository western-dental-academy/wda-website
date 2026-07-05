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
- **Payments:** Stripe — NOT YET INSTALLED (waiting on business details from Lance/Jolene)
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
- `/apply` — Multi-step application form ✓ Connected to Sanity
- `/book-a-tour` — Tour booking
- `/contact` — Contact + Google Maps embed
- `/edmonton-dental-careers` — Local SEO page
- `/privacy-policy`, `/terms-of-use`, `/accessibility` — Legal pages
- `/coming-soon` — Maintenance mode page
- `/portal` — Student portal ✓ BUILT (protected by Clerk)
- `/sign-in` — Clerk sign-in page (auto-generated)
- `/sign-up` — Clerk sign-up page (auto-generated)
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

```typescript
const clerkHandler = clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) await auth.protect()
})

export async function proxy(request) {
  const clerkResponse = await clerkHandler(request, {} as any)
  if (clerkResponse) return clerkResponse
  // ... maintenance mode logic
}
```

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

---

## Sanity CMS

### Studio Access (local)
`http://localhost:3000/studio?preview=wda2026`

### Schema Types (all in `sanity/schemaTypes/`)
- `program` — WDA programs (includes `moodleCourseId` number field to link to Moodle)
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
- `clerkUserId` — string, readOnly, auto-populated on first portal visit
- `stripeCustomerId` — string, readOnly, auto-populated on Stripe customer creation
- `applicationDate`, `acceptedDate`
- `notes` — internal staff notes, not visible to student

### Sanity API Token
Must be **Editor** role (read + write) — a read-only token will cause API route failures.

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
| Progress tracking | ✓ Complete |
| Grade display | ✓ Complete |
| Certificate generation (PDF) | ✓ Complete |
| Stripe payments | ✗ Waiting on business details |
| LTI 1.3 SSO | ✗ Not built |

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
Student logs into portal → /api/students/link-clerk links Clerk ID to Sanity
        ↓
Portal shows progress, grades, profile, Moodle link
        ↓
Course complete → Download certificate PDF
```

### Clerk Authentication ✓ INSTALLED
- Package: `@clerk/nextjs`
- App: "Western Dental Academy" on Clerk dashboard
- `ClerkProvider` wraps body in `app/layout.tsx`
- `auth()` and `currentUser()` are async in Next.js 15 — always await them
- Never expose `CLERK_SECRET_KEY` in client code
- Sign-in page: `/sign-in`, Sign-up page: `/sign-up`

### Certificate Generation ✓ BUILT
- Package: `@react-pdf/renderer`
- Generator: `lib/certificate/generate.tsx`
- API route: `GET /api/students/certificate`
- Only available when all Moodle modules are complete (100%)
- Downloads as `WDA-Certificate-[FirstName]-[LastName].pdf`

### Stripe (NOT YET INSTALLED)
- Waiting on CRA business number and banking details from Lance/Jolene
- WDA is a Ltd. corporation — register as "Company" in Stripe
- Use Stripe Checkout or Elements — never handle raw card data
- Webhook: `/api/webhooks/stripe` — always verify signatures
- Store `stripeCustomerId` and `stripePaymentIntentId` on Sanity student documents

---

## Moodle LMS Integration

### Local Development
- **Docker folder:** `C:\Users\brost\Desktop\Aiden\WDA\moodle-local\`
- **Start:** `docker compose up -d`
- **Stop:** `docker compose stop`
- **Local URL:** `http://localhost:8080`
- **Admin:** username `admin` / password `Admin1234!`
- **Moodle version:** 5.2.1 — requires MySQL 8.4
- **APACHE_DOCUMENT_ROOT:** `/var/www/html/moodle/public` (Moodle 5.2 requirement)
- **config.php wwwroot:** `http://localhost:8080` (no /moodle suffix)
- **Moodledata:** `/var/moodledata`
- **Welcome email errors on enrollment:** safe to ignore locally (no mail server)

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
  - `core_course_get_contents`

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
- `getMoodleCourseContents(moodleCourseId)` — get course modules with names

**Note:** `enrolMoodleUser` silently catches "Message was not sent" errors — enrollment succeeds despite this in local Docker.

### Sanity Webhook → Moodle
- **Webhook URL (local):** `https://<ngrok-url>/api/webhooks/sanity`
- **Webhook URL (production):** `https://westerndentalacademy.com/api/webhooks/sanity`
- **Secret:** stored in `.env.local` as `SANITY_WEBHOOK_SECRET=wda-sanity-webhook-2026`
- **Trigger:** Update on `student` documents where `_type == "student"`
- **Logic:** Only acts when `status === 'accepted'`
- **Package:** `@sanity/webhook` for signature verification
- **Note:** ngrok URL changes on each restart — update Sanity webhook URL at sanity.io/manage each session

---

## Student Portal (/portal)

### Features Built
- Protected by Clerk — redirects to `/sign-in` if not authenticated
- Links Clerk user to Sanity student record on every visit
- Status-based UI: no record / pending / accepted / enrolled
- Course progress bar with percentage
- Module completion list with real activity names from Moodle
- Grade display from Moodle gradebook
- Student profile section (name, email, phone, program, dates)
- Certificate download when course is 100% complete
- Go to Moodle course button

### Portal Layout
`app/portal/layout.tsx` — checks auth, calls `/api/students/link-clerk`

### Next Portal Features to Build
- LTI 1.3 SSO (auto-login to Moodle without second password)
- Payment status / tuition balance (after Stripe)
- Notification system

---

## API Routes Reference

| Route | Method | Status | Purpose |
|---|---|---|---|
| `/api/students/apply` | POST | ✓ Built | Save application to Sanity |
| `/api/students/link-clerk` | POST | ✓ Built | Link Clerk user ID to Sanity student |
| `/api/students/certificate` | GET | ✓ Built | Generate and download PDF certificate |
| `/api/webhooks/sanity` | POST | ✓ Built | Moodle provisioning on student acceptance |
| `/api/moodle/test` | GET | Dev only | List Moodle courses |
| `/api/moodle/test-enroll` | GET | Dev only | Test enrollment |
| `/api/students/provision` | POST | Not built | Manual provisioning trigger |
| `/api/moodle/suspend` | POST | Not built | Suspend Moodle account |
| `/api/lti/launch` | POST | Not built | LTI 1.3 SSO to Moodle |
| `/api/webhooks/stripe` | POST | Not built | Stripe payment events |
| `/api/webhooks/moodle` | POST | Not built | Moodle completion events |

---

## Security & Compliance

### Alberta PIPA
All student data must stay on Canadian servers.
- Moodle host: DigitalOcean Toronto or MoodleCloud CA
- Third-party security review required before go-live

### Security Practices
- Input validation: **Zod** on all API route inputs
- Security headers in `next.config.ts`
- Never hardcode secrets — `.env.local` + Vercel dashboard
- Verify all webhook signatures (`@sanity/webhook`, Stripe)
- Use LTI 1.3 (not deprecated LTI 1.1)
- `CLERK_SECRET_KEY` server-side only — never in client code
- `SANITY_API_TOKEN` must be Editor role — never read-only for API routes

---

## Environment Variables (Full List)

```bash
# Analytics
NEXT_PUBLIC_GA_ID=

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=          # Must be Editor role (read + write)

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Stripe (not yet installed)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Moodle
MOODLE_URL=http://localhost:8080
MOODLE_TOKEN=
MOODLE_COURSE_DAC_DD=2

# Sanity Webhook
SANITY_WEBHOOK_SECRET=wda-sanity-webhook-2026

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

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
| 5 | Clerk authentication install + setup | ✓ Complete |
| 6 | Sanity webhook → Moodle auto-provisioning | ✓ Complete |
| 7 | Student portal — progress, grades, profile, certificates | ✓ Complete |
| 8 | Stripe payments + webhook | Waiting on business details |
| 9 | LTI 1.3 SSO | Planned |
| 10 | Production Moodle hosting + migration | Planned |
| 11 | Go live — remove maintenance mode | Planned |