# CLAUDE.md — Western Dental Academy Platform

This file provides Claude Code with full project context. Read this before making any changes.

---

## ⚠️ Critical Rules — Read First

- **NEVER run `npm audit fix` or `npm update`** — Framer Motion is pinned to exactly `12.39.0` via `package.json` and `overrides`. Upgrading silently breaks SSR animations site-wide.
- **NEVER overwrite the `role` field on `staffMember`** — it controls system access (`staff`/`owner`). Job title is stored in `jobTitle`.
- **Always use Canadian English** in all copy.
- **CADA compliance rules** — never use: "program" (use "workshop", "course", or "event"), "certified/certification" (use "Certificate of Attendance"), "accredited", "distance delivery". Use "dental training" not "dental education" (except the preserved tagline). Location is "Edmonton Area" not "Sherwood Park".
- **Middleware file is `proxy.ts`** not `middleware.ts` — Clerk's `clerkMiddleware()` lives there.
- **Two Sanity accounts exist** — only use project `p8yox22i` (Microsoft login). The other (`lgaofd9n`, Google login) is empty/unused.
- **Workshop name keys must match Sanity offering titles exactly** — WORKSHOP_PRICES keys, OFFERING_STATIC keys, and lib/workshops/offerings.ts keys must all match the Sanity `workshopOffering.title` field exactly or registration/certificate lookups will fail.
- **Never use `npm audit fix`** — will bump Framer Motion and break SSR animations.
- **Draft filter required on all Sanity queries** — always include `!(_id in path("drafts.**"))` in every GROQ query to prevent draft documents appearing alongside published ones.
- **Buffer to Uint8Array** — when returning PDF buffers in Next.js API routes, always wrap in `new Uint8Array(buffer)` before passing to `new NextResponse()` or `new Response()`.

---

## Project Overview

| Field | Value |
|---|---|
| **Site** | westerndentalacademy.com |
| **Developer** | Aiden Brost — aiden@westerndentalacademy.com |
| **Project folder** | `C:\Users\brost\Desktop\Aiden\WDA\WDA Website\wda-website` |
| **GitHub** | github.com/western-dental-academy/wda-website |
| **Deployment** | Vercel (WDA account) |
| **Status** | Live — maintenance mode OFF |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| CMS | Sanity (project: `p8yox22i`, dataset: `production`) |
| Auth | Clerk (production instance) |
| Payments | Stripe (LIVE, CAD) |
| Email | Resend |
| Cache | Upstash Redis |
| Forms | reCAPTCHA v3 |
| PDF | @react-pdf/renderer |
| Animation | Framer Motion **pinned to 12.39.0** |
| Deployment | Vercel |
| LMS | Moodle 5.2 — learn.westerndentalacademy.com (DigitalOcean TOR1, `143.110.221.1`) |
| Microsoft | Microsoft Graph API (`@azure/identity`, `@microsoft/microsoft-graph-client`) |

---

## Brand Colors

| Name | Hex | Usage |
|---|---|---|
| Navy | `#0D3B6E` | Primary — headings, nav, footer, backgrounds |
| Blue | `#378ADD` | Secondary — accents, links |
| Light Blue | `#4BA3E3` | Accent |
| Amber | `#E67E22` | CTA only — buttons, highlights |

**Fonts:** Montserrat Bold/SemiBold (headings), Open Sans Regular (body)

---

## Architecture — CADA Compliance Branch Strategy

The site runs on `main` branch as a public-facing **Professional Development** site (CADA-compliant, no DAC-DD promotion). The full SIS/enrollment platform is preserved on the `full-platform` branch.

**When CADA approves:**
```bash
git checkout main && git merge full-platform && git push origin HEAD
```

---

## Key People

| Name | Role | Email | Access Level |
|---|---|---|---|
| Aiden Brost | Digital Operations & Technology Coordinator | aiden@westerndentalacademy.com | Owner + IT |
| Lance Parker | CEO | lance@westerndentalacademy.com | Owner |
| Ryan Zmurchuk | CEO | ryan@westerndentalacademy.com | Owner |
| Jolene Moore | COO | jolene@westerndentalacademy.com | Admin |
| Alana Welsh | Program Director | alana@westerndentalacademy.com | Admin |
| Collette Funk-Ross | Program Chair | collette@westerndentalacademy.com | Admin |
| Tammy Parker | Instructor | tammy@westerndentalacademy.com | Admin + Financial |

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `SANITY_API_TOKEN` | Sanity Editor role token (server-side write access) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `p8yox22i` |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `CLERK_SECRET_KEY` | Clerk server-side auth |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk client-side |
| `STRIPE_SECRET_KEY` | Stripe live secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe live publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |
| `RESEND_API_KEY` | Email sending via Resend |
| `UPSTASH_REDIS_REST_URL` | Redis cache URL |
| `UPSTASH_REDIS_REST_TOKEN` | Redis cache token |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA v3 server-side |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA v3 client-side |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 |
| `AZURE_TENANT_ID` | Microsoft Graph API tenant (`ace28189-3767-4d67-b9ee-402dffc1db52`) |
| `AZURE_CLIENT_ID` | Microsoft Graph API client |
| `AZURE_CLIENT_SECRET` | Microsoft Graph API secret |
| `VERCEL_ACCESS_TOKEN` | Maintenance mode toggle |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `VERCEL_MAINTENANCE_ENV_ID` | `KhTLQMVKSoi0hVsZ` |
| `VERCEL_REPO_ID` | `1244021411` |
| `CRON_SECRET` | Vercel cron job authentication |
| `WEEKLY_SUMMARY_SECRET` | Manual trigger for weekly work summary email |

**Note:** Microsoft Clarity ID hardcoded in `components/MicrosoftClarity.tsx` as `ybgoq5pp4m`.

---

## Role-Based Access Control

| Constant | Emails | Controls |
|---|---|---|
| `ADMIN_EMAILS` | All 7 staff | WDA Hub dashboard access |
| `OWNER_EMAILS` | aiden, lance, ryan, tammy | Staff panel — see all clock entries + approvals |
| `FINANCIAL_EMAILS` | aiden, lance, ryan, tammy | Revenue tab visibility |
| `SANITY_EMAILS` | aiden only | Sanity Studio button + IT tab |

---

## Sanity Schemas

### Core Schemas
| Schema | Purpose |
|---|---|
| `staffMember` | Staff profiles — `clerkUserId`, `staffId`, `jobTitle`, `department`, `role` (system: staff/owner) |
| `teamMember` | Public About page team bios — image field is `photo` (not `image`), name field is `name` |
| `blogPost` | Blog articles |
| `faqItem` | FAQ entries |
| `giftCertificate` | Gift certificates — code, amount, recipientName, recipientEmail, senderName, message, purchasedAt, expiresAt, redeemedAt, redeemedBy, stripeSessionId, status (active/redeemed/expired/admin), isAdminGenerated |

### Professional Development Schemas
| Schema | Purpose |
|---|---|
| `workshopOffering` | The "what" — title, category, description, price, virtualPrice, hasVirtualOption, capacity, hours, cadaCppCodes, includesFood, teamsWebinarId, feedbackEnabled |
| `workshopDate` | The "when" — reference to offering, date, active, feedbackEnabled |
| `workshopRegistration` | Individual registrant record — workshopDateId (string), workshop (plain string frozen at checkout), deliveryMethod, pronouns, mediaConsent, dietaryRestrictions, feedbackToken, feedbackRating, feedbackSubmittedAt, feedbackShareConsent, teamsRegistrationId |
| `workshopWaitlist` | Waitlist entries for full workshops |
| `workshopFeedback` | All feedback (both QR and email-link) — workshopDateId, workshopName, rating, enjoyedMost, improvement, wouldRecommend, shareConsent, submittedAt, respondentName, source (email-link/qr-code), registrationId |
| `timeOffRequest` | Staff time-off — type, startDate, endDate, startTime, endTime, halfDay, status, staffMember ref, calendarEventId (Teams Graph event ID for deletion on cancel) |

### Sanity Studio Structure
```
Professional Development
  └── Events
        ├── Offerings (category == 'workshop' || 'guest-speaker')
        ├── Workshop Dates
        ├── Workshop Registrations
        ├── Workshop Waitlist
        └── Workshop QR Feedback
  └── Courses
        └── Offerings (category == 'course')
Gift Certificates
Staff Time Tracking
  └── Staff Members
  └── Hours Log
  └── Time Off Requests
```

---

## Workshop Offerings (Current in Sanity)

| Offering (must match exactly) | Category | Price | Virtual | Capacity | Hours |
|---|---|---|---|---|---|
| Ergonomics in Healthcare: Neck and Shoulders | workshop | $40 | No | 15 | 1.5 |
| Ergonomics in Healthcare: Hands, Feet, and Spine | workshop | $40 | No | 15 | 1.5 |
| Ergonomics in Healthcare: Hips and Hamstrings | workshop | $40 | No | 15 | 1.5 |
| Renewal Wellness | guest-speaker | $129/$99 virtual | Yes | 20/unlimited | 6.25 |
| National Board Guided Practice | workshop | $750 | No | — | 8 |

**WORKSHOP_PRICES keys** (must match Sanity titles exactly):
- `"Ergonomics in Healthcare: Neck and Shoulders"` → 40
- `"Ergonomics in Healthcare: Hands, Feet, and Spine"` → 40
- `"Ergonomics in Healthcare: Hips and Hamstrings"` → 40
- `"Renewal Wellness"` → 129
- `"National Board Guided Practice"` → 750

---

## Category Consolidation

- Sanity backend: `workshop`, `guest-speaker`, `course`
- Frontend display: both `workshop` and `guest-speaker` = **"Events"**
- PD page tabs: Events, Courses, Practical Exam Prep, Gift Certificates
- Registration form dropdown: "Events", "Courses"
- Home page "What We Offer": "Events", "Courses"

---

## Registration Flow (Single Registrant)

1. Select category → select offering → select date
2. If `hasVirtualOption`: In-Person/Virtual toggle, price updates
3. If in-person + `includesFood`: dietary restrictions field appears
4. Fill form: name, email, phone, pronouns, dental background, CADA number, media consent, share consent
5. Optional gift certificate code field
6. Capacity checked, duplicate email+date check runs
7. Stripe checkout → `/register/success`
8. On success:
   - Confirmation email with agenda (Renewal Wellness)
   - Virtual registrants auto-registered in Teams via Graph API
   - Gift certificate marked redeemed if code used
   - Admin notification sent

---

## Gift Certificate System

- **Purchase:** `/gift-certificates` page → Stripe checkout → PDF emailed to recipient
- **Code format:** `WDA-XXXX-XXXX` (alphanumeric, no ambiguous chars)
- **Expiry:** 1 year from purchase date
- **Redemption:** code entered at `/register` checkout, applies as discount
- **Admin door prizes:** Hub → Gift Certificates tab → "Generate Door Prize" → downloads PDF immediately, no Stripe/email
- **PDF generator:** `lib/giftCertificatePdf.tsx` — landscape, navy background, amber accents
- **Sanity schema:** `giftCertificate` — status: active/redeemed/expired/admin
- **Admin panel:** Gift Certificates tab in WDA Hub (all admin)

---

## API Routes

### Workshop Routes
| Route | Method | Purpose |
|---|---|---|
| `/api/workshops/dates` | GET | Fetch active future workshop dates |
| `/api/workshops/checkout` | POST | Stripe checkout (single registrant, optional gift code) |
| `/api/workshops/check-capacity` | GET | Check capacity + deliveryMethod |
| `/api/feedback` | POST | Per-registrant feedback (token) — also creates workshopFeedback doc |
| `/api/feedback/workshop` | POST | QR + email-link feedback → workshopFeedback doc |

### Gift Certificate Routes
| Route | Method | Purpose |
|---|---|---|
| `/api/gift-certificates/checkout` | POST | Create Stripe session for gift certificate purchase |
| `/api/admin/gift-certificates/generate` | POST | Admin door prize generation (no Stripe) |

### Admin Routes
| Route | Method | Purpose |
|---|---|---|
| `/api/admin/workshop-dates` | GET/POST | List/create workshop dates |
| `/api/admin/workshop-dates/[id]` | PATCH/DELETE | Update/delete a workshop date |
| `/api/admin/workshop-offerings` | GET | List all offerings |
| `/api/admin/workshop-checkin` | POST | Check in + certificate + feedback token |
| `/api/admin/workshop-registrations` | GET | List registrations |

### Staff Routes
| Route | Method | Purpose |
|---|---|---|
| `/api/staff/id-card` | GET | Staff ID card PDF |
| `/api/staff/weekly-summary` | GET | Weekly work summary email (cron + manual) |
| `/api/staff/clock-in` | POST | Clock in |
| `/api/staff/clock-out` | POST | Clock out |
| `/api/staff/time-off` | POST | Submit time-off request |
| `/api/time/cancel` | POST | Cancel own time-off request + delete Teams calendar event |
| `/api/time/approve` | POST | Approve/deny + create Teams calendar event |

### IT Routes
| Route | Method | Purpose |
|---|---|---|
| `/api/it/*-status` | GET | Health checks (site, moodle, sanity, stripe, resend, redis) |

---

## Vercel Cron Jobs

| Schedule | Route | Purpose |
|---|---|---|
| `0 14 * * 3` (Wed 8AM MDT) | `/api/staff/weekly-summary` | Weekly work summary email to Aiden |

---

## WDA Hub Admin Dashboard

| Tab | Access | Contents |
|---|---|---|
| Overview | All admin | Stats, task manager, staff calendar |
| Students | All admin | Student table, announcements |
| Professional Development | All admin | PD Schedule, PD Registrations (check-in, certs), PD Feedback |
| Gift Certificates | All admin | All GCs table, Generate Door Prize button |
| Marketing | All admin | Canva planner, quick links |
| Staff | All admin | My Clock, My Documents, time-off. Owners: Recent Time Entries (collapsible, expandable notes), team approvals |
| Revenue | Financial only | Stripe data |
| IT | aiden@ only | Health checks, Maintenance Mode, Sanity Studio |

---

## Staff ID Cards

- Format: `WDA-S-10001` through `WDA-S-19999`
- CR80 size (243pt × 153pt), @react-pdf/renderer
- Logo: `https://westerndentalacademy.com/Inverted.png` fetched as base64
- Photo: fetched from `teamMember.photo.asset->url` + `?fm=jpg` (JPEG conversion for renderer compatibility)
- QR code: `api.qrserver.com` → westerndentalacademy.com, navy on white
- Layout: header (navy + logo + STAFF label) → body (photo left, name/role/dept/ID right) → bottom row (issue date left, QR right)

**Assigned IDs:**
| Name | Staff ID | Job Title | Department |
|---|---|---|---|
| Aiden | WDA-S-10001 | Digital Operations & Technology Coordinator | Technology |
| Jolene | WDA-S-10002 | Chief Operating Officer | Operations |
| Alana | WDA-S-10003 | Program Director | Academic |
| Collette | WDA-S-10004 | Program Chair | Academic |
| Tammy | WDA-S-10005 | Instructor | Academic |
| Lance | WDA-S-10006 | Chief Executive Officer | Administration |
| Ryan | WDA-S-10007 | Chief Executive Officer | Administration |

---

## Feedback System

All feedback stored as `workshopFeedback` documents going forward (both QR and email-link).
- **Email-link:** `/feedback?token=XXXX` — shows "Hi [Name Initial].", pre-filled, POSTs to `/api/feedback/workshop` with source: 'email-link'
- **QR code:** `/feedback/workshop/[id]` — optional name field, anonymous allowed, source: 'qr-code'
- **Admin:** unified "PD Feedback" panel — grouped by workshop, "Via Email" navy / "Via QR" grey badges, "Can Share" green badge, respondent name displayed
- Existing per-registrant feedback on `workshopRegistration` docs kept as-is (not migrated)

---

## Certificate of Attendance

- Generated via `lib/workshops/certificate.tsx` (@react-pdf/renderer)
- Triggered on check-in via admin Hub → PD Registrations
- Contains: logo (inverted, white on navy), recipient name, workshop, date, hours, learning objectives, speaker breakdown (Renewal Wellness only)
- **CCP code numbers removed** — no longer shown on certificate
- **Learning objectives** defined in `lib/workshops/offerings.ts` per offering
- Single page enforced with `wrap={false}` and absolute-positioned footer

---

## Microsoft Teams / Graph API

- **Purpose:** Auto-register virtual attendees in Teams webinar + shared calendar events
- **Helper:** `lib/microsoft-graph.ts` — `graphClient`, `registerTeamsWebinarAttendee()`, `createCalendarEvent()`
- **Shared calendar:** `WDAteamsite@westerndentalacademy.com`
- **Triggers:**
  - Time-off approved → all-day or timed calendar event (halfDay support)
  - Workshop date added → timed calendar event
  - Time-off cancelled → calendar event deleted (calendarEventId stored on timeOffRequest)
- **Renewal Wellness webinar ID:** `9c637229-bcf5-40f2-b96d-0bfb2da1bf7b`
- **Tenant ID:** `ace28189-3767-4d67-b9ee-402dffc1db52`

---

## Professional Development Page

- Route: `/professional-development` — `force-dynamic`, `cache: 'no-store'`
- **Tabs:** Events, Courses, Practical Exam Prep, Gift Certificates
- Ergonomics grouped card (titles starting "Ergonomics in Healthcare") — per-session register buttons with dateId URL param
- `OFFERING_STATIC` in `PDTabs.tsx` — keys must match Sanity titles exactly
- Cards: collapsed by default with Read More toggle, register button always visible
- In-Person/Virtual dual buttons for offerings with `hasVirtualOption: true`

### Renewal Wellness Speakers (accordion)
1. Jolene Moore — Western Dental Academy — Registration Renewal Unraveled
2. Samantha Coleman & Emily Griffiths — Sleep Well Diagnostics Ltd — Obstructive Sleep Apnea
3. TBD — Session 3 (speaker TBD, objective to be updated when confirmed)
4. Josie McKenzie — PFSL Investments — Financial Wellness — Drill Down Into Your Finances
5. Tony Korobanik — Prepared Now — Limiting Your Liability in Emergency Situations

### When Session 3 Speaker is Confirmed — Update These Files:
- `app/professional-development/PDTabs.tsx` — OFFERING_STATIC speakers accordion
- `lib/workshops/offerings.ts` — learning objectives (remove dementia, add new)
- `app/register/success/page.tsx` — agenda table row for Session 3
- `lib/workshops/certificate.tsx` — objectives auto-update from offerings.ts

---

## Pages & Routes

| Page | Route | Notes |
|---|---|---|
| Home | `/` | Events + Courses + gift certificate section |
| About | `/about` | Team photos use hotspot-aware cropping via urlFor().fit('crop').crop('focalpoint') |
| Professional Development | `/professional-development` | Dynamic, force-dynamic |
| Practical Exam Prep | `/national-board-guided-practice` | $750, 301 from /national-board-preparation |
| Gift Certificates | `/gift-certificates` | Public purchase page |
| Gift Certificates Success | `/gift-certificates/success` | Post-payment, sends PDF email |
| Blog | `/blog` | Sanity-powered, share buttons on listing + post pages |
| Contact | `/contact` | Address + second floor note + gift certificate callout |
| Sponsorship | `/sponsorship` | Footer-only |
| Register | `/register` | Single registrant, gift code field, URL params: ?offering=&dateId=&delivery= |
| Register Success | `/register/success` | Confirmation + Teams registration |
| Feedback | `/feedback` | Email-link feedback with name greeting |
| Feedback QR | `/feedback/workshop/[id]` | QR feedback with optional name |
| Staff Portal | `/staff` | Clock, ID card download, time-off (cancel button for future requests) |
| Admin Hub | `/admin` | WDA Hub |
| Studio | `/studio` | Append ?preview=wda2026 |

**Redirects:** `/national-board-preparation` → `/national-board-guided-practice`, `/faq` → `/contact`, `/workshops` → `/professional-development`

---

## Moodle LMS

- **URL:** learn.westerndentalacademy.com
- **Server:** DigitalOcean TOR1, `143.110.221.1`, SSH: `ssh root@143.110.221.1`
- **Hosted directly on droplet** (not Docker)
- **Config:** `$CFG->sslproxy = true`, nginx 443→8080, exact Host header match required

---

## Key File Locations

- `proxy.ts` — Clerk middleware
- `lib/staff/idCard.tsx` — Staff ID card PDF
- `lib/giftCertificatePdf.tsx` — Gift certificate PDF
- `lib/microsoft-graph.ts` — Graph API (Teams webinar + calendar)
- `lib/workshops/offerings.ts` — Workshop metadata (hours, CADA codes, learning objectives, speaker breakdown) — keys must match Sanity titles exactly
- `lib/workshops/certificate.tsx` — Certificate of Attendance PDF (single page, no CCP codes)
- `lib/sanity/image.ts` — urlFor() with hotspot-aware cropping
- `components/AdminTabs.tsx` — WDA Hub tab controller
- `components/admin/AdminGiftCertificates.tsx` — Gift Certificates admin panel
- `components/admin/AdminWorkshopFeedback.tsx` — Unified PD Feedback panel
- `app/professional-development/PDTabs.tsx` — PD page + OFFERING_STATIC map
- `scripts/migrate-workshop-offerings.ts` — One-time migration (DRY_RUN=true, do not run again)

---

## Known Issues / Constraints

- **Clerk biometrics/passkeys** — require Pro plan, not enabled
- **npm audit** — 12 unfixable vulnerabilities in @sanity/telemetry chain, safe to ignore
- **Vercel preview URLs** — Clerk middleware errors expected, production unaffected
- **Resend IT health check** — returns 401 (expected for send-only key), treated as Operational
- **Ryan Zmurchuk** — has not accepted Clerk invite
- **workshopRegistration.workshop** — plain string frozen at checkout, not retroactively updated when offering titles change