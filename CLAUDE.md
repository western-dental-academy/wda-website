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
**GitHub org:** github.com/western-dental-academy (public repo)
**Repo:** western-dental-academy/wda-website
**Deployment:** Vercel (WDA account, separate from Make One Productions)
**Git push command:** `git push origin HEAD`

---

## Ecosystem Architecture

```
westerndentalacademy.com        ← Public marketing website (Next.js / Vercel)
         ↕ Internal API routes
  WDA SIS (Student Info System)  ← Enrollment, records, payments (same Next.js app)
         ↕ REST API
       Moodle LMS               ← Course delivery (DigitalOcean Toronto)
               learn.westerndentalacademy.com
```

---

## Tech Stack

### Website & SIS
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **CMS:** Sanity (programs, team, blog, student records, subscribers, announcements)
- **Auth:** Clerk ✓ INSTALLED (production instance)
- **Payments:** Stripe ✓ LIVE (Canadian CAD, Scotia bank account)
- **Email:** Resend (from info@westerndentalacademy.com)
- **PDF Generation:** @react-pdf/renderer
- **Rate Limiting:** @upstash/ratelimit + @upstash/redis
- **Bot Protection:** react-google-recaptcha-v3 (reCAPTCHA v3)
- **Progress Bar:** nextjs-toploader
- **Fonts:** Montserrat (headings), Open Sans (body) via Google Fonts
- **Animations:** Framer Motion
- **Deployment:** Vercel
- **Domain registrar:** GoDaddy (.com), Vercel DNS (.ca → 301 redirect to .com)

### Moodle LMS — PRODUCTION
- **Platform:** Moodle 5.2.1
- **Hosting:** DigitalOcean Droplet — Toronto TOR1 (PIPA compliant)
- **Server IP:** 143.110.221.1
- **Server specs:** 4GB RAM, 2 vCPU, 80GB SSD (~$24/month)
- **URL:** https://learn.westerndentalacademy.com
- **Admin login:** admin / (check password manager — changed from default)
- **SSH:** `ssh root@143.110.221.1`
- **Moodle files on server:** `/opt/moodle/`
- **Docker compose:** `/opt/moodle/docker-compose.yml`
- **Nginx config:** `/etc/nginx/sites-available/moodle`
- **SSL:** Let's Encrypt (auto-renews via certbot)

### Moodle Server Notes
- Docker containers: `wda_moodle` (Apache/PHP) and `wda_moodle_db` (MySQL 8.4)
- Apache runs on port 8080 internally, Nginx proxies 443 → 8080
- Nginx must pass `Host: learn.westerndentalacademy.com` header or Moodle redirects
- `config.php` has `$CFG->sslproxy = true` — required for HTTPS behind proxy
- `wwwroot` = `https://learn.westerndentalacademy.com`
- Restart containers: `cd /opt/moodle && docker compose restart`
- Web services enabled via CLI: `docker exec -u www-data wda_moodle php /var/www/html/moodle/admin/cli/cfg.php --name=enablewebservices --set=1`
- REST protocol enabled via CLI: `docker exec -u www-data wda_moodle php /var/www/html/moodle/admin/cli/cfg.php --name=webserviceprotocols --set=rest`

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
**LMS content owners:** Alana Welsh, Collette Funk-Ross, Tamara Parker (all have Teacher + Course creator roles in Moodle)
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
- `Western Dental Academy Logo Alternate-1.png` — PNG version for PDFs (certificates, transcripts, ID cards)

### Favicon
`favicon.ico` and `apple-icon.png` live in `/app` (not `/public`) — Next.js App Router convention.

---

## Website Structure

### Pages Built
- `/` — Home (newsletter signup)
- `/about` — About WDA (team members from Sanity)
- `/programs` — Programs listing
- `/programs/[slug]` — Individual program pages
- `/blog` — Blog listing (Sanity-driven)
- `/blog/[slug]` — Blog posts
- `/faq` — FAQ
- `/apply` — Multi-step application form (5 steps including transcript upload)
- `/book-a-tour` — Tour booking
- `/contact` — Contact + Google Maps embed + Resend email
- `/edmonton-dental-careers` — Local SEO page
- `/privacy-policy`, `/terms-of-use`, `/accessibility` — Legal pages
- `/coming-soon` — Maintenance mode page
- `/portal` — Student portal (protected by Clerk, tabbed layout)
- `/admin` — Staff admin dashboard (protected, whitelist-based)
- `/sign-in` — Clerk sign-in (redirects admin → /admin, students → /portal)
- `/sign-up` — Clerk sign-up
- `/verify/[code]` — Public certificate verification page
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

**Critical:** API routes must pass through BEFORE Clerk handler. `/auth/redirect` must bypass maintenance mode check.

Protected routes (Clerk auth required):
- `/portal(.*)`
- `/admin(.*)`
- `/auth/redirect(.*)`
- `/api/students/provision(.*)`

---

## Sanity CMS

### Studio Access (local)
`http://localhost:3000/studio?preview=wda2026`

### Schema Types
- `program` — WDA programmes (includes `moodleCourseId`, `tuitionAmount`)
- `teamMember` — staff profiles (photo via @sanity/image-url)
- `testimonial` — student quotes
- `blogPost` — blog articles
- `faqItem` — FAQ entries
- `student` — student records ✓
- `subscriber` — newsletter subscribers ✓
- `announcement` — student portal announcements ✓

### Student Schema Fields
- `firstName`, `lastName`, `email`, `phone`
- `status` — pending / accepted / rejected / enrolled / withdrawn
- `program` — reference to program document
- `cohort` — string matching Moodle cohort ID number (e.g. `DAC-DD-2026-09`)
- `moodleUserId` — number, readOnly
- `clerkUserId` — string, readOnly
- `stripeCustomerId`, `stripePaymentIntentId` — readOnly
- `paymentStatus` — unpaid / pending / paid / refunded
- `tuitionAmount` — auto-populated from program on acceptance
- `certificateId` — unique verification code (e.g. `WDA-2026-A4F2K`)
- `certificateIssuedDate` — datetime
- `transcriptFile` — file asset uploaded during application
- `applicationDate`, `acceptedDate`
- `notes` — internal notes, parsed for admin review panel

### Sanity API Token
Must be **Editor** role (read + write).

### Sanity Webhook
- **Production URL:** `https://westerndentalacademy.com/api/webhooks/sanity`
- **Secret:** `SANITY_WEBHOOK_SECRET=wda-sanity-webhook-2026`
- **Trigger:** Update on `student` documents
- **Logic:** Handles accepted (Moodle provision + Clerk account + welcome email), rejected (email), withdrawn (Moodle suspend + email)
- **Loop prevention:** Skips if `moodleUserId` already set

---

## SIS — Student Information System

### Build Status — ALL COMPLETE
| Module | Status |
|---|---|
| Sanity student schema | ✓ |
| Apply form (5 steps + transcript upload) | ✓ |
| reCAPTCHA v3 on apply form | ✓ |
| Rate limiting on apply + subscribe | ✓ |
| Clerk authentication (production instance) | ✓ |
| Auto Clerk account creation on acceptance | ✓ |
| Sanity webhook → Moodle provisioning | ✓ |
| Sanity webhook → rejection/withdrawal emails | ✓ |
| Moodle account suspension on withdrawal | ✓ |
| Clerk ↔ Sanity student linking | ✓ |
| Student portal (tabbed — 7 tabs) | ✓ |
| Announcements system | ✓ |
| Assignment submission status | ✓ |
| Course progress tracking | ✓ |
| Grade display | ✓ |
| Payment history | ✓ |
| Programme calendar | ✓ |
| Certificate generation (PDF + QR) | ✓ |
| Certificate verification page | ✓ |
| Grade export to PDF transcript | ✓ |
| Digital student ID card PDF | ✓ |
| Stripe payments (LIVE) | ✓ |
| Stripe processing fee pass-through | ✓ |
| Newsletter subscription → Sanity | ✓ |
| Contact form → Resend | ✓ |
| Admin dashboard | ✓ |
| Admin quick accept/reject/withdraw | ✓ |
| Application review panel (with transcript) | ✓ |
| Revenue dashboard | ✓ |
| Referral tracking | ✓ |
| Student search and filter | ✓ |
| Moodle progress in admin table | ✓ |
| Cohort management | ✓ |
| Weekly progress email digest (cron) | ✓ |
| Payment reminder cron | ✓ |
| Admin notification on new application | ✓ |
| Welcome email on acceptance | ✓ |

### Enrollment Flow (WORKING END TO END)
```
Student submits /apply form (reCAPTCHA, transcript upload)
        ↓
Admin notified via email
        ↓
Staff reviews application + transcript in admin dashboard review panel
        ↓
Staff clicks Accept → Sanity webhook fires
        ↓
Clerk account created → welcome email sent with sign-in instructions
        ↓
Moodle user created → enrolled in course → cohort assigned (if set)
        ↓
Student signs in → redirected to /portal
        ↓
Student pays tuition via Stripe Checkout (with processing fee)
        ↓
Stripe webhook → paymentStatus = "paid"
        ↓
Student completes course → certificate + transcript + ID card available
```

### Student ID Number
`studentId = moodleUserId + 99999`
- First student: Moodle ID 1 → Student ID 100000
- Displayed in: portal profile, admin table, student ID card PDF

### Student Portal Tabs
1. **Overview** — announcements, progress bar, enrollment status
2. **Course** — module completion, assignment status, Go to Moodle button
3. **Grades** — grade table from Moodle
4. **Calendar** — assignment due dates, announcements
5. **Payments** — tuition payment, payment history
6. **Documents** — certificate, transcript, student ID card
7. **Profile** — student information

### Admin Dashboard Features
- Stats cards (total, pending, accepted, enrolled, paid)
- Revenue dashboard (Stripe data)
- Referral tracking chart
- Student table with search/filter
- Student ID column
- Moodle progress bars per student
- Quick Accept/Reject/Withdraw buttons
- Application review panel (full details + transcript preview)
- Go to Moodle button
- Open Sanity Studio button
- Sign out button

### Admin Email Whitelist (in app/admin/page.tsx and app/portal/layout.tsx)
```
aiden@westerndentalacademy.com
aiden2@westerndentalacademy.com
jolene@westerndentalacademy.com
alana@westerndentalacademy.com
collette@westerndentalacademy.com
tammy@westerndentalacademy.com
```

### Sign-In Flow
- Everyone uses `/sign-in`
- After sign-in → `/portal` → layout checks admin email → admins redirected to `/admin`
- Students stay on `/portal`
- Clerk Client Trust: **DISABLED** in both dev and production instances

### Stripe Payments (LIVE)
- Currency: CAD
- Bank: Scotia
- Processing fee: `Math.round((amountInCents + 30) / (1 - 0.029) - amountInCents)` passed through to student
- Webhook: `https://westerndentalacademy.com/api/webhooks/stripe`
- Payout: automatic daily to Scotia account

---

## Moodle LMS Integration

### Production Moodle
- **URL:** `https://learn.westerndentalacademy.com`
- **SSH:** `ssh root@143.110.221.1`
- **Admin:** admin / (check password manager)
- **Instructor accounts:** Alana Welsh, Collette Funk-Ross, Tamara Parker (Teacher + Course creator)

### Moodle Courses
| Course | Short Name | Moodle ID |
|---|---|---|
| Dental Assisting Certificate — Distance Delivery | DAC-DD | 2 |
| NDAB Exam Preparation | NDAB | TBD (no moodleCourseId — Moodle not required) |

### Moodle API Configuration
- Web services: enabled
- REST protocol: enabled
- External service: **WDA SIS** (authorised users only)
- Functions enabled:
  - `core_user_create_users`, `core_user_update_users`, `core_user_get_users`
  - `enrol_manual_enrol_users`
  - `core_completion_get_activities_completion_status`
  - `gradereport_user_get_grade_items`
  - `core_course_get_courses`, `core_course_get_contents`
  - `core_cohort_get_cohorts`, `core_cohort_add_cohort_members`
  - `mod_assign_get_assignments`, `mod_assign_get_submissions`
  - `core_webservice_get_site_info`

### Moodle API Client
**Location:** `lib/moodle/client.ts`

Exports: `moodleRequest`, `createMoodleUser`, `updateMoodleUser`, `enrolMoodleUser`, `getMoodleProgress`, `getMoodleGrades`, `getMoodleCourses`, `getMoodleCourseContents`, `getMoodleAssignments`, `getMoodleSubmissions`, `addUserToMoodleCohort`

**Note:** Programmes without `moodleCourseId` (e.g. NDAB) skip all Moodle provisioning.

### Cohort Management
- Cohorts created in Moodle with ID format: `[PROGRAM-CODE]-[YEAR]-[MONTH]`
- Example: `DAC-DD-2026-09` = Dental Assisting Certificate, September 2026 intake
- Set `cohort` field on student record in Sanity → auto-assigned to Moodle cohort on acceptance

---

## Documents Generated (PDFs)

### Certificate of Completion
- Location: `lib/certificate/generate.tsx`
- Route: `GET /api/students/certificate`
- Requires: 100% module completion in Moodle
- Includes: student name, programme, date, unique ID, QR code
- QR links to: `westerndentalacademy.com/verify/[certificateId]`

### Academic Transcript
- Location: `lib/transcript/generate.tsx`
- Route: `GET /api/students/transcript`
- Includes: student info, grade table, module completion, WDA logo

### Student ID Card
- Location: `lib/idcard/generate.tsx`
- Route: `GET /api/students/id-card`
- Student ID: `moodleUserId + 99999` (6-digit format starting at 100000)
- Includes: name, programme, student ID, QR code

### Certificate Verification
- Public page: `/verify/[code]`
- Anyone can verify by scanning QR code or visiting the URL

---

## Automated Emails (via Resend from info@westerndentalacademy.com)

| Trigger | Email | Recipient |
|---|---|---|
| New application submitted | Admin notification with details + Sanity Studio link | info@westerndentalacademy.com |
| Application accepted | Welcome email with sign-in instructions | Student |
| Application rejected | Professional decline email | Student |
| Student withdrawn | Withdrawal confirmation | Student |
| Payment not received after 3 days | Payment reminder | Student |
| Every Monday 8AM MDT | Weekly progress digest | All enrolled students |
| Contact form submitted | Contact form contents | info@westerndentalacademy.com |

---

## Cron Jobs (Vercel)

Defined in `vercel.json`:
- `GET /api/cron/payment-reminder` — runs daily at 9:00 AM UTC
- `GET /api/cron/progress-digest` — runs every Monday at 14:00 UTC (8:00 AM MDT)

Both require `Authorization: Bearer ${CRON_SECRET}` header.

---

## API Routes Reference

| Route | Method | Status | Purpose |
|---|---|---|---|
| `/api/students/apply` | POST | ✓ | Save application + transcript ref to Sanity |
| `/api/students/upload-transcript` | POST | ✓ | Upload transcript file to Sanity assets |
| `/api/students/link-clerk` | POST | ✓ | Link Clerk ID to Sanity student |
| `/api/students/certificate` | GET | ✓ | Generate PDF certificate |
| `/api/students/transcript` | GET | ✓ | Generate PDF transcript |
| `/api/students/id-card` | GET | ✓ | Generate PDF student ID card |
| `/api/stripe/checkout` | POST | ✓ | Create Stripe Checkout session |
| `/api/subscribe` | POST | ✓ | Save newsletter subscriber |
| `/api/contact` | POST | ✓ | Send contact form via Resend |
| `/api/webhooks/sanity` | POST | ✓ | Student status changes → Moodle + emails |
| `/api/webhooks/stripe` | POST | ✓ | Payment confirmed → update Sanity |
| `/api/admin/update-student-status` | POST | ✓ | Quick accept/reject/withdraw from admin dashboard |
| `/api/admin/student-progress` | GET | ✓ | Fetch Moodle progress for admin table |
| `/api/cron/payment-reminder` | GET | ✓ | Daily payment reminder cron |
| `/api/cron/progress-digest` | GET | ✓ | Weekly progress email cron |
| `/api/moodle/test` | GET | Dev only | List Moodle courses |
| `/api/moodle/test-enroll` | GET | Dev only | Test enrollment |

---

## Security Implementation

### Completed
- ✓ Rate limiting on apply and subscribe (Upstash Redis)
- ✓ reCAPTCHA v3 on apply form (production only)
- ✓ Clerk auth on portal and admin routes
- ✓ Admin email whitelist on dashboard and API routes
- ✓ Stripe webhook signature verification
- ✓ Sanity webhook signature verification
- ✓ Moodle admin password changed from default
- ✓ API routes pass through before Clerk handler
- ✓ Clerk Client Trust disabled

### Still To Do Before Go-Live
- [ ] Zod input validation on all API routes
- [ ] Third-party security review
- [ ] PIPA compliance documentation

---

## Local Development — What to Run

1. **Dev server** (VS Code terminal): `npm run dev`
2. **Local Moodle** (optional — now using production): `cd C:\Users\brost\Desktop\Aiden\WDA\moodle-local && docker compose up -d`
3. **Stripe CLI** (only for local payment testing): `C:\stripe\stripe.exe listen --forward-to localhost:3000/api/webhooks/stripe`
4. **ngrok** (only for local Sanity webhook testing): `ngrok http 3000` then update webhook URL at sanity.io/manage

---

## Environment Variables (Full List)

```bash
# Analytics
NEXT_PUBLIC_GA_ID=

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=          # Must be Editor role

# Clerk (production instance)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=   # pk_live_...
CLERK_SECRET_KEY=                     # sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/portal?preview=wda2026
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/portal?preview=wda2026

# Stripe (LIVE)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=   # pk_live_...
STRIPE_SECRET_KEY=                     # sk_live_...
STRIPE_WEBHOOK_SECRET=                 # whsec_... (production webhook secret)

# Moodle (PRODUCTION)
MOODLE_URL=https://learn.westerndentalacademy.com
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

# Resend
RESEND_API_KEY=

# Cron
CRON_SECRET=wda-cron-secret-2026

# Site
NEXT_PUBLIC_SITE_URL=https://westerndentalacademy.com   # http://localhost:3000 locally

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
| `learn` | A | `143.110.221.1` | Moodle on DigitalOcean |
| `clerk` | CNAME | `frontend-api.clerk.services` | Clerk production |
| `accounts` | CNAME | `accounts.clerk.services` | Clerk accounts portal |
| `clkmail` | CNAME | `mail.o5mey20qhs9e.clerk.services` | Clerk email |
| `clk._domainkey` | CNAME | `dkim1.o5mey20qhs9e.clerk.services` | Clerk DKIM |
| `clk2._domainkey` | CNAME | `dkim2.o5mey20qhs9e.clerk.services` | Clerk DKIM |
| MX / SPF / DKIM / DMARC | — | Microsoft 365 values | Email |
| Resend CNAME | — | Resend values | Transactional email |

---

## Build Phases

| Phase | Scope | Status |
|---|---|---|
| 1 | Marketing website | ✓ Complete |
| 2 | Sanity schemas | ✓ Complete |
| 3 | Moodle local setup + API client | ✓ Complete |
| 4 | Apply form → Sanity (with transcript upload) | ✓ Complete |
| 5 | Clerk authentication (production) | ✓ Complete |
| 6 | Sanity webhook → full provisioning flow | ✓ Complete |
| 7 | Student portal (7 tabs) | ✓ Complete |
| 8 | Stripe payments (LIVE) | ✓ Complete |
| 9 | Automation (emails, crons, cohorts) | ✓ Complete |
| 10 | Admin dashboard (full features) | ✓ Complete |
| 11 | PDF documents (certificate, transcript, ID card) | ✓ Complete |
| 12 | Production Moodle on DigitalOcean Toronto | ✓ Complete |
| 13 | Go live — flip maintenance mode off | Next |

---

## Go-Live Checklist
- [ ] Set `MAINTENANCE_MODE=false` in Vercel
- [ ] Confirm all Vercel env vars are production values
- [ ] Test full enrollment flow on production (apply → accept → Moodle → portal → pay → certificate)
- [ ] Confirm westerndentalacademy.com loads correctly
- [ ] Third-party security review
- [ ] Send staff their Clerk login credentials
- [ ] Brief instructors on Moodle (learn.westerndentalacademy.com)
- [ ] Add WDA branding to Moodle (logo, colours)
- [ ] Set up first cohort in Moodle (DAC-DD-2026-09 or similar)