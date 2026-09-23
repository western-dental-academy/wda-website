# Western Dental Academy — Developer Reference

## Critical Rules (Read First)
- **NEVER** run `npm audit fix` or `npm update` — Framer Motion is pinned to exactly `12.39.0`
- **NEVER** overwrite the `role` field on `staffMember` Sanity schema — it controls system access. Job title is in `jobTitle`
- Always use **Canadian English**
- **CADA compliance**: never use "program", "certified/certification", "accredited", "distance delivery". Use "dental training" not "dental education". Location is "Edmonton Area" not "Sherwood Park"
- Middleware file is `proxy.ts` not `middleware.ts`
- Only use Sanity project **`p8yox22i`** (Microsoft login) — never `lgaofd9n`
- All Sanity GROQ queries must include `!(_id in path("drafts.**"))` to exclude drafts
- Workshop/offering name keys must match Sanity titles exactly across `WORKSHOP_PRICES`, `OFFERING_STATIC`, and `lib/workshops/offerings.ts`
- When returning PDF buffers in API routes, always wrap in `new Uint8Array(buffer)`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| CMS | Sanity (project `p8yox22i`, dataset `production`) |
| Auth | Clerk |
| Payments | Stripe (LIVE CAD) |
| Email | Resend |
| Cache/Queue | Upstash Redis |
| PDF | @react-pdf/renderer |
| Animation | Framer Motion **pinned 12.39.0** |
| Hosting | Vercel |
| LMS | Moodle 5.2 (DigitalOcean TOR1) |
| Calendar/Webinar | Microsoft Graph API |

---

## Brand

**Colours:** Navy `#0D3B6E` · Blue `#378ADD` · Light Blue `#4BA3E3` · Amber `#E67E22`  
**Fonts:** Montserrat Bold/SemiBold (headings) · Open Sans Regular (body)

---

## Infrastructure

| Service | Value |
|---------|-------|
| GitHub | `github.com/western-dental-academy/wda-website` |
| Local path | `C:\Users\brost\Desktop\Aiden\WDA\WDA Website\wda-website` |
| Live site | `westerndentalacademy.com` |
| Moodle | `learn.westerndentalacademy.com` · SSH: `ssh root@143.110.221.1` |
| Sanity Studio | `westerndentalacademy.com/studio` (append `?preview=wda2026`) |
| Teams calendar | `WDAteamsite@westerndentalacademy.com` |
| Microsoft Graph tenant | `ace28189-3767-4d67-b9ee-402dffc1db52` |
| Moodle IP | `143.110.221.1` |

---

## Key Contacts

| Name | Email | Role |
|------|-------|------|
| Aiden Brost | aiden@westerndentalacademy.com | Digital Operations & Technology Coordinator |
| Lance Parker | lance@westerndentalacademy.com | CEO |
| Ryan Zmurchuk | ryan@westerndentalacademy.com | CEO |
| Jolene Moore | jolene@westerndentalacademy.com | COO |
| Alana Welsh | alana@westerndentalacademy.com | Program Director |
| Collette Funk-Ross | collette@westerndentalacademy.com | Program Chair / Lead Instructor |
| Tammy Parker | tammy@westerndentalacademy.com | Instructor |

Admin emails (ADMIN_EMAILS array in code): `aiden@westerndentalacademy.com`, `jolene@westerndentalacademy.com`

---

## Environment Variables

### Vercel (Production)
```
NEXT_PUBLIC_SANITY_PROJECT_ID=p8yox22i
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=...
SANITY_WEBHOOK_SECRET=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
RESEND_API_KEY=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
MOODLE_BASE_URL=https://learn.westerndentalacademy.com
MOODLE_TOKEN=...           # ← must be added before online courses go live
MOODLE_WEBHOOK_SECRET=...  # ← must be added before online courses go live
MOODLE_COURSE_DAC_DD=...   # Moodle course ID for Dental Assisting Certificate
MICROSOFT_TENANT_ID=ace28189-3767-4d67-b9ee-402dffc1db52
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
```

---

## Sanity Schemas

### Core Types
- `staffMember` — staff profiles; `role` field controls system access (DO NOT overwrite); `jobTitle` for display
- `program` — accredited dental assisting programs
- `post` — blog posts
- `page` — general CMS pages
- `siteSettings` — global settings singleton

### Workshop / Offering Types
- `workshopOffering` — in-person/hybrid workshops with sessions, pricing, registration
- `professionalDevelopmentOffering` — PD offerings (CE credits, CADA compliance)

### Online Course Types
- `onlineCourse` — virtual self-paced courses
  - Fields: `title`, `slug`, `description`, `image`, `active` (bool), `moodleCourseId` (number), `tuitionAmount` (number), `extensionPrice` (number, added recently), `durationDays` (number, default 21)
- `courseEnrollment` — per-student enrollment record
  - Fields: `student` (ref→student), `course` (ref→onlineCourse), `status` (`active`|`suspended`|`expired`|`extended`), `enrolledAt`, `expiresAt`, `accessExpiresAt`, `moodleUserId`, `moodleEnrolmentId`, `midpointReminderSentAt`, `feedbackToken`, `feedbackRating` (1–5), `feedbackEnjoyedMost`, `feedbackImprovement`, `feedbackWouldRecommend` (bool), `feedbackShareConsent` (bool), `feedbackSubmittedAt`

### Student Type
- `student` — student records
  - Fields: `firstName`, `lastName`, `email`, `phone`, `status` (`pending`|`accepted`|`enrolled`|`rejected`|`withdrawn`), `paymentStatus` (`paid`|`unpaid`|`pending`), `applicationDate`, `acceptedDate`, `tuitionAmount`, `cohort`, `program` (ref), `moodleUserId`

---

## Key File Locations

### App Routes
```
app/
  admin/page.tsx                          — WDA Hub admin dashboard (server component)
  api/
    admin/
      courses/
        suspend/route.ts                  — POST: suspend a course enrollment
        reactivate/route.ts               — POST: reactivate a suspended enrollment
    webhooks/
      sanity/route.ts                     — Sanity webhook: student accepted → Moodle provisioning + email
      moodle-completion/route.ts          — Moodle completion webhook → certificate PDF email + feedback token
      stripe/route.ts                     — Stripe webhook: payment → enroll student
    courses/
      feedback/route.ts                   — POST: save course feedback to courseEnrollment
  courses/
    [slug]/page.tsx                       — Public online course landing page
    enroll/[slug]/page.tsx               — Enrollment / checkout page
    feedback/page.tsx                     — Token-gated feedback form (post-completion)
  portal/
    page.tsx                              — Student portal (Clerk auth)
  studio/[[...tool]]/page.tsx            — Sanity Studio embed
```

### Components
```
components/
  admin/
    AdminCourseEnrollments.tsx            — Course enrollments table + CourseOfferingsPanel
  AdminTabs.tsx                           — Tab switcher for WDA Hub (passes courseOfferings prop)
```

### Libraries
```
lib/
  moodle/
    client.ts                             — createMoodleUser, enrolMoodleUser, suspendUserEnrollment, reactivateUserEnrollment
  workshops/
    offerings.ts                          — OFFERING_STATIC config (name keys must match Sanity exactly)
  sanity/
    client.ts                             — Sanity client instances
```

### Config
```
sanity/
  schemaTypes/
    onlineCourse.ts
    courseEnrollment.ts
    student.ts
    staffMember.ts
    workshopOffering.ts
    professionalDevelopmentOffering.ts
    ...
proxy.ts                                  — Next.js middleware (NOT middleware.ts)
```

---

## WDA Hub Admin Dashboard

Located at `/admin`. Requires Clerk auth + email in `ADMIN_EMAILS`.

### Tabs
1. **Overview** — summary stats
2. **Students** — student applications table with status/payment badges
3. **Courses** — online course enrollments
   - **CourseOfferingsPanel** — collapsible table per course: enrollment count, revenue, active/suspended/expired counts
   - **Enrollment table** — per-student rows with: expiry colour coding (red = past, amber = ≤3 days), midpoint reminder badge (✓ Sent), suspend/reactivate buttons, extended status
4. **Professional Development** — PD offering registrations
5. **Workshops** — workshop session registrations
6. **Staff** — staff member management

### Suspend / Reactivate Flow
- `POST /api/admin/courses/suspend` — body: `{ enrollmentId }` → calls `suspendUserEnrollment(moodleUserId, moodleCourseId)`, sets Sanity status: `suspended`
- `POST /api/admin/courses/reactivate` — body: `{ enrollmentId }` → fetches `accessExpiresAt` from enrollment, calls `reactivateUserEnrollment(moodleUserId, moodleCourseId, newAccessExpiresAt)`, sets Sanity status: `active`
  - Falls back to 21 days from now if `accessExpiresAt` is missing

---

## Moodle Integration

### Connection
- Base URL: `https://learn.westerndentalacademy.com`
- Auth: REST API token (`MOODLE_TOKEN`)
- SSH: `ssh root@143.110.221.1`

### lib/moodle/client.ts Functions
```typescript
createMoodleUser(user: {...}) → Promise<MoodleUser[]>
enrolMoodleUser(userId: number, courseId: number) → Promise<void>
suspendUserEnrollment(moodleUserId: number, moodleCourseId: number) → Promise<void>
reactivateUserEnrollment(moodleUserId: number, moodleCourseId: number, newAccessExpiresAt: Date) → Promise<void>
```

### Course Configuration (Online Courses — Year-Round)
- **Start date**: Set to a past date (e.g., Jan 1, 2024) so students enrolling at any time get immediate access
- **End date**: None (no end date)
- **Duration**: Controlled by per-enrollment `expiresAt` = `enrolledAt + durationDays` (default 21 days)
- Moodle course dates do NOT gate individual student access — enrollment `expiresAt` does

### Messaging Restrictions
- "Allow site-wide messaging" = **No** (default, checkbox unchecked) ✓ Correct
- Students can only message users in their enrolled courses (Collette as Teacher)
- No further configuration needed

### Completion Webhook
- Configured in Moodle: Admin → Plugins → Webhooks → `POST /api/webhooks/moodle-completion`
- On completion: generates `feedbackToken`, saves to `courseEnrollment`, sends certificate PDF email with feedback CTA

---

## Online Courses

### Dental Assisting Certificate (DAC DD)
- Moodle course ID: env var `MOODLE_COURSE_DAC_DD`
- Status: Active

### Oral Pathology Refresher (Brush-up)
- Status: Built in Sanity, **not yet active** — flip `active: true` when Collette finishes reviewing
- Once active: ensure `MOODLE_TOKEN` and `MOODLE_WEBHOOK_SECRET` are in Vercel env vars

---

## Workshop / PD Offerings

Workshop name keys in `WORKSHOP_PRICES`, `OFFERING_STATIC`, and `lib/workshops/offerings.ts` **must match Sanity titles exactly**.

Current offerings include ergonomics workshops (e.g., "Ergonomics in Dentistry: Move Well, Breathe Well, Practice Longer") — developed by a Registered Dental Assistant / Registered Yoga Teacher. Length: 1.5 hrs, $30, CADA Competency Profile compliant.

---

## Course Feedback System

Triggered after Moodle completion certificate is delivered.

### Flow
1. Moodle fires completion webhook → `POST /api/webhooks/moodle-completion`
2. Route generates `feedbackToken = crypto.randomUUID()`, saves to `courseEnrollment.feedbackToken`
3. Certificate PDF email sent to student with feedback CTA link: `/courses/feedback?token=<feedbackToken>`
4. Student visits `/courses/feedback` — token-gated form ("Hi [firstName]!")
   - Fields: 1–5 star rating, enjoyed most (text), improvement suggestion (text), would recommend (bool), share consent (bool)
5. Form submits to `POST /api/courses/feedback` → saves all feedback fields + `feedbackSubmittedAt` to `courseEnrollment`
6. Feedback visible in Admin Hub → Courses tab → enrollment row

---

## Email (Resend)

From address: `Western Dental Academy <info@westerndentalacademy.com>`

### Automated Emails
- **Application accepted** — welcome email with Moodle credentials + student portal link
- **Application rejected** — polite rejection with reapply encouragement
- **Withdrawal confirmed** — confirmation of withdrawal, access deactivated
- **Certificate delivery** — PDF attachment + feedback CTA
- **Midpoint reminder** — sent at day 10/21 of enrollment window (tracked via `midpointReminderSentAt`)

---

## Stripe

- **Mode**: LIVE CAD
- Webhook: `POST /api/webhooks/stripe` → on `payment_intent.succeeded` → enroll student
- Always use `new Uint8Array(buffer)` when returning PDF buffers

---

## Microsoft Graph / Teams

- Tenant: `ace28189-3767-4d67-b9ee-402dffc1db52`
- Used for: Teams webinar registration, shared calendar (`WDAteamsite@westerndentalacademy.com`)
- Ryan Zmurchuk has **not yet accepted** his Clerk invite

---

## Pending / To-Do

- [ ] Add `MOODLE_TOKEN` and `MOODLE_WEBHOOK_SECRET` to Vercel env vars before online courses go live
- [ ] Flip Oral Pathology Refresher `active: true` in Sanity when Collette approves
- [ ] Configure Moodle completion webhook in Moodle Admin → Plugins → Webhooks
- [ ] Test course feedback system end-to-end
- [ ] Ryan Zmurchuk — resend/accept Clerk invite
- [ ] Verify Moodle course start date is set to a past date for year-round enrollment