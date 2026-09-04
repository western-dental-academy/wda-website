# CLAUDE.md — Western Dental Academy Platform

This file provides Claude Code with full project context. Read this before making any changes.

---

## ⚠️ Critical Rules — Read First

- **NEVER run `npm audit fix` or `npm update`** — Framer Motion is pinned to exactly `12.39.0` via `package.json` and `overrides`. Upgrading silently breaks SSR animations site-wide.
- **NEVER overwrite the `role` field on `staffMember`** — it controls system access (`staff`/`owner`). Job title is stored in `jobTitle`.
- **Always use Canadian English** in all copy.
- **CADA compliance rules** — never use: "program" (use "workshop" or "course"), "certified/certification" (use "Certificate of Attendance"), "accredited", "distance delivery". Use "dental training" not "dental education" (except the preserved tagline). Location is "Edmonton Area" not "Sherwood Park".
- **Middleware file is `proxy.ts`** not `middleware.ts` — Clerk's `clerkMiddleware()` lives there.
- **Two Sanity accounts exist** — only use project `p8yox22i` (Microsoft login). The other (`lgaofd9n`, Google login) is empty/unused.

---

## Project Overview

| Field | Value |
|---|---|
| **Site** | westerndentalacademy.com |
| **Developer** | Aiden Brost — aiden@westerndentalacademy.com |
| **Project folder** | `C:\Users\brost\Desktop\Aiden\WDA\WDA Website\wda-website` |
| **GitHub** | github.com/western-dental-academy/wda-website |
| **Deployment** | Vercel (WDA account, separate from Make One Productions) |
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
| Aiden Brost | Digital Operations Coordinator | aiden@westerndentalacademy.com | Owner + IT |
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
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity (hardcoded: `ybgoq5pp4m`) |
| `VERCEL_ACCESS_TOKEN` | Maintenance mode toggle |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `VERCEL_MAINTENANCE_ENV_ID` | `KhTLQMVKSoi0hVsZ` |
| `VERCEL_REPO_ID` | `1244021411` |
| `AZURE_TENANT_ID` | Microsoft Graph API tenant |
| `AZURE_CLIENT_ID` | Microsoft Graph API client |
| `AZURE_CLIENT_SECRET` | Microsoft Graph API secret |

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
| `teamMember` | Public About page team bios |
| `blogPost` | Blog articles |
| `faqItem` | FAQ entries |

### Professional Development Schemas
| Schema | Purpose |
|---|---|
| `workshopOffering` | The "what" — title, category, description, price, virtualPrice, hasVirtualOption, capacity, hours, cadaCppCodes, includesFood, teamsWebinarId, feedbackEnabled |
| `workshopDate` | The "when" — reference to offering, date, active, feedbackEnabled |
| `workshopRegistration` | Individual registrant record — links to workshopDate, stores Stripe session, deliveryMethod, pronouns, mediaConsent, dietaryRestrictions, feedbackToken, feedbackRating, feedbackSubmittedAt, teamsRegistrationId |
| `workshopWaitlist` | Waitlist entries for full workshops |
| `workshopFeedback` | Anonymous QR code feedback (separate from per-registrant feedback) |

### Sanity Studio Structure
```
Professional Development
  └── Workshops
        ├── Offerings (filtered: category == 'workshop')
        ├── Workshop Dates
        ├── Workshop Registrations
        ├── Workshop Waitlist
        └── Workshop QR Feedback
  └── Guest Speakers
        └── Offerings (filtered: category == 'guest-speaker')
  └── Courses
        └── Offerings (filtered: category == 'course')
Staff (under Staff Time Tracking group)
```

---

## Workshop Offerings (Current)

| Offering | Category | Price | Virtual | Capacity | Hours | CADA Codes |
|---|---|---|---|---|---|---|
| Ergonomics in Dentistry: Hands, Feet and Spine | workshop | $40 | No | 15 | 1.5 | B-4-2, I-5-3, I-5-4 |
| Ergonomics in Dentistry: Hips and Hamstrings | workshop | $40 | No | 15 | 1.5 | B-4-2, I-5-3, I-5-4 |
| Ergonomics in Dentistry: Neck and Shoulders | workshop | $40 | No | 15 | 1.5 | B-4-2, I-5-3, I-5-4 |
| National Board Guided Practice | workshop | $600 | No | — | 8 | — |
| Renewal Wellness | guest-speaker | $129 in-person / $99 virtual | Yes | 20 in-person / unlimited virtual | 6.25 | I-2-1, D-3-1, G-3-TBD, I-5-4, B-5-3 |

**Note:** Ergonomics three sessions shown as one grouped card on PD page. Offerings only added to Sanity when ready to schedule.

---

## Registration Flow

1. Registrant selects category (dropdown) → selects workshop → selects date
2. If `hasVirtualOption`: In-Person/Virtual toggle appears, price updates dynamically
3. If in-person + `includesFood`: dietary restrictions textarea appears
4. Primary registrant fills full form (name, email, pronouns, dental background, CADA number, media consent)
5. Additional registrants: simplified form (no pronouns/media consent)
6. Each person added to cart — capacity checked per add (virtual = unlimited, in-person = enforced)
7. Single Stripe checkout session created with one line item per registrant
8. On success (`/register/success`):
   - Each registrant gets individual confirmation email (Resend)
   - Primary registrant gets receipt email with all registrants listed
   - Virtual registrants auto-registered in Teams webinar via Microsoft Graph API
   - Teams sends each virtual registrant their unique join link
   - Admin notification sent

---

## API Routes

### Workshop Routes
| Route | Method | Purpose |
|---|---|---|
| `/api/workshops/dates` | GET | Fetch active workshop dates with offering details |
| `/api/workshops/checkout` | POST | Create Stripe checkout session (multi-registrant) |
| `/api/workshops/check-capacity` | GET | Check remaining capacity for a date |
| `/api/feedback` | POST | Submit per-registrant feedback (token-based) |
| `/api/feedback/workshop` | POST | Submit anonymous QR feedback |

### Admin Routes
| Route | Method | Purpose |
|---|---|---|
| `/api/admin/workshop-dates` | GET/POST | List/create workshop dates |
| `/api/admin/workshop-dates/[id]` | PATCH/DELETE | Update/delete a workshop date |
| `/api/admin/workshop-offerings` | GET | List all offerings (for Add Date dropdown) |
| `/api/admin/workshop-checkin` | POST | Check in registrant + send certificate + generate feedback token |
| `/api/admin/workshop-registrations` | GET | List registrations |

### Staff Routes
| Route | Method | Purpose |
|---|---|---|
| `/api/staff/id-card` | GET | Generate staff ID card PDF |
| `/api/staff/clock-in` | POST | Clock in |
| `/api/staff/clock-out` | POST | Clock out |
| `/api/staff/time-off` | POST | Submit time-off request |

### IT Routes
| Route | Method | Purpose |
|---|---|---|
| `/api/it/site-status` | GET | Check live site health |
| `/api/it/moodle-status` | GET | Check Moodle health |
| `/api/it/sanity-status` | GET | Check Sanity health |
| `/api/it/stripe-status` | GET | Check Stripe health |
| `/api/it/resend-status` | GET | Check Resend health |
| `/api/it/redis-status` | GET | Check Redis health |

---

## WDA Hub Admin Dashboard

Located at `/admin`. Tabs:

| Tab | Access | Contents |
|---|---|---|
| Overview | All admin | Stats, task manager, staff calendar |
| Students | All admin | Student table, announcements, applicants chart |
| Professional Development | All admin | PD Schedule (Add Date, QR codes), PD Registrations (check-in, certificates), PD Feedback (unified per-registrant + QR feedback) |
| Marketing | All admin | Canva planner link card, quick links (Canva, Instagram, Facebook, LinkedIn, Google Business, Google Analytics, Microsoft Clarity) |
| Staff | All admin | My Clock, My Documents (Staff ID Card download), time-off requests. Owners also see: Recent Time Entries (collapsible, default collapsed), team approvals |
| Revenue | Financial emails only | Stripe revenue data |
| IT | aiden@ only | Health checks (6 cards), Maintenance Mode toggle, Sanity Studio button |

---

## Staff ID Cards

- Format: `WDA-S-10001` through `WDA-S-19999`
- PDF generated via `@react-pdf/renderer` at CR80 size (243pt × 153pt)
- Logo fetched as base64 at request time from `https://westerndentalacademy.com/Inverted.png`
- Fields on card: name, jobTitle, department, staffId, issued date
- Download button in both `/staff` portal and Staff tab of WDA Hub
- `staffId`, `jobTitle`, `department` stored on `staffMember` Sanity schema

**Assigned IDs:**
| Name | Staff ID | Job Title | Department |
|---|---|---|---|
| Aiden | WDA-S-10001 | Digital Operations Coordinator | Technology |
| Jolene | WDA-S-10002 | Chief Operating Officer | Operations |
| Alana | WDA-S-10003 | Program Director | Academic |
| Collette | WDA-S-10004 | Program Chair | Academic |
| Tammy | WDA-S-10005 | Instructor | Academic |
| Lance | WDA-S-10006 | Chief Executive Officer | Administration |
| Ryan | WDA-S-10007 | Chief Executive Officer | Administration |

---

## Feedback System

### Per-Registrant Feedback (Email Link)
- Triggered after check-in — certificate email includes "Leave Feedback" button
- URL: `/feedback?token=XXXX` (token = `crypto.randomUUID()`, stored on `workshopRegistration`)
- One-time use — `feedbackSubmittedAt` guards against resubmission
- Fields: 1-5 star rating, enjoyed most (optional), improvement (optional), would recommend (Yes/No)

### Anonymous QR Feedback
- QR code shown in PD Schedule panel per workshop date
- URL: `/feedback/workshop/[workshopDateId]`
- Stored as separate `workshopFeedback` documents in Sanity
- `feedbackEnabled` boolean on `workshopDate` controls availability

### Admin Display
- Both sources merged into unified "PD Feedback" panel in PD tab
- Normalized to common interface, grouped by workshop, sorted by date
- Source badge: navy "Via Email" / grey "Via QR"

---

## Microsoft Teams / Graph API Integration

- **Purpose:** Auto-register virtual attendees in Teams webinar on payment completion
- **Flow:** Stripe payment success → `registerTeamsWebinarAttendee()` → Teams sends unique join link to each attendee
- **Helper:** `lib/microsoft-graph.ts` — `graphClient` + `registerTeamsWebinarAttendee()`
- **Credentials:** `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` (app registration in Azure AD)
- **Webinar ID stored:** `teamsWebinarId` field on `workshopOffering` in Sanity
- **Registration ID stored:** `teamsRegistrationId` on `workshopRegistration` after successful Graph API call
- **Renewal Wellness Webinar ID:** `9c637229-bcf5-40f2-b96d-0bfb2da1bf7b`
- **Confirmation email:** Virtual attendees told "You will receive a unique Microsoft Teams join link directly from Microsoft"
- Teams handles unique link delivery — no manual link sending needed

---

## Professional Development Page

- Route: `/professional-development`
- `force-dynamic` + `cache: 'no-store'` — always fetches fresh from Sanity
- Ergonomics offerings (title starts with "Ergonomics in Dentistry") grouped as single card
- All other offerings rendered as individual `WorkshopOfferingCard` components
- `OFFERING_STATIC` map in `PDTabs.tsx` controls highlights, tags, displayTitle overrides, food notes, agenda notes
- Card shows "Registration Open" (green) if active date exists, "Coming Soon" (amber) if not
- Offerings pulled from Sanity automatically — add new offering in Studio to have it appear

### OFFERING_STATIC Keys (must match Sanity title exactly)
- `"Ergonomics in Dentistry: Neck and Shoulders"` (and other Ergonomics variants)
- `"Renewal Wellness"` — displayTitle: "Renewal Wellness Guest Speaker Event", durationOverride: "All Day Event"
- `"National Board Guided Practice"`

---

## Pages & Routes

| Page | Route | Notes |
|---|---|---|
| Home | `/` | Hero, stats, workshop preview, CTA |
| About | `/about` | Team, mission, values |
| Professional Development | `/professional-development` | Dynamic workshop cards from Sanity |
| Practical Exam Prep | `/national-board-guided-practice` | Redirected from `/national-board-preparation` |
| Blog | `/blog` | Sanity-powered |
| Contact | `/contact` | Contact form + FAQ section |
| Sponsorship | `/sponsorship` | Footer-only link |
| Register | `/register` | Multi-registrant cart registration form |
| Register Success | `/register/success` | Post-payment confirmation |
| Feedback | `/feedback` | Per-registrant token-based feedback form |
| Feedback (QR) | `/feedback/workshop/[id]` | Anonymous QR feedback form |
| Staff Portal | `/staff` | Clerk-protected staff portal |
| Admin Hub | `/admin` | Clerk-protected WDA Hub |
| Sanity Studio | `/studio` | CMS (append `?preview=wda2026` to bypass preview) |

**Redirects in `next.config.ts`:**
- `/national-board-preparation` → `/national-board-guided-practice` (301)
- `/faq` → `/contact` (301)
- `/workshops` → `/professional-development` (301)

---

## Moodle LMS

- **URL:** learn.westerndentalacademy.com
- **Server:** DigitalOcean TOR1, `143.110.221.1`, SSH: `ssh root@143.110.221.1`
- **Docker:** containers `wda_moodle` / `wda_moodle_db` at `/opt/moodle`
- **Config:** `$CFG->sslproxy = true`, nginx proxies 443→8080 with exact Host header match
- **DAC-DD course ID:** 2
- **WDA SIS webservice token:** generated, 12 functions enabled

---

## Microsoft Clarity

- Project ID: `ybgoq5pp4m`
- Account: `aiden@westerndentalacademy.com`
- Hardcoded in `components/MicrosoftClarity.tsx` (not env var — Clarity IDs are public)
- Only fires after cookie consent accepted

---

## Google Analytics

- Property: `a395405849p538480450`
- Direct link: `https://analytics.google.com/analytics/web/#/a395405849p538480450/reports/intelligenthome`

---

## Known Issues / Constraints

- **Clerk biometrics/passkeys** require Pro plan ($25/mo) — not enabled
- **npm audit** shows 12 unfixable vulnerabilities in `@sanity/telemetry` chain — dev-only, safe to ignore
- **Vercel preview URLs** throw Clerk middleware errors — expected, production domain unaffected
- **Resend IT health check returns 401** — expected for send-only API key, treated as "Operational"
- **Ryan Zmurchuk** has not accepted Clerk invite

---

## File Structure Notes

- `proxy.ts` — Clerk middleware (not `middleware.ts`)
- `lib/staff/idCard.tsx` — Staff ID card PDF generator
- `lib/microsoft-graph.ts` — Microsoft Graph API helper
- `lib/workshops/offerings.ts` — Workshop metadata map (hours, CADA codes, pricing)
- `lib/workshops/certificate.tsx` — Certificate of Attendance PDF generator
- `components/AdminTabs.tsx` — Main WDA Hub tab controller
- `components/admin/AdminMarketing.tsx` — Marketing tab
- `components/admin/AdminWorkshopFeedback.tsx` — Unified PD Feedback panel
- `components/staff/DownloadIdCardButton.tsx` — Staff ID card download button
- `scripts/migrate-workshop-offerings.ts` — One-time migration script (DRY_RUN=true, do not run again)
- `app/professional-development/PDTabs.tsx` — PD page tab content + dynamic cards
