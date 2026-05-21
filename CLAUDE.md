# CLAUDE.md — Western Dental Academy Website

This file provides Claude Code with full project context for the WDA website build. Read this before making any changes.

---

## Project Overview

**Client:** Western Dental Academy (WDA)
**Website:** westerndentalacademy.com
**Purpose:** Marketing and enrollment website for a dental professional training institution offering dental assisting programs, continuing education, and hands-on clinical training.

**Developer:** Aiden (Make One Productions) — aiden2@westerndentalacademy.com
**Project folder:** `C:\Users\brost\Desktop\Aiden\WDA\WDA Website\wda-website`
**GitHub:** github.com/western-dental-academy/wda-website
**Deployment:** Vercel (WDA account, separate from Make One)
**CMS:** Sanity (content management for programs, team, blog)

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **CMS:** Sanity
- **Fonts:** Montserrat (headings) via Google Fonts — this is the exact font used in the WDA logo
- **Deployment:** Vercel
- **Domain:** westerndentalacademy.com (GoDaddy DNS, Google Workspace email)

---

## Brand Identity

### Mission
Western Dental Academy trains next-generation dental professionals through hands-on learning, modern clinical technology, and a curriculum focused on real-world readiness and compassionate patient care.

### Core Values
Professionalism · Modern Innovation · Compassion · Integrity

### Visual Tone
Clean, trustworthy, academic yet cutting-edge. Lean heavily into whitespace. Think modern dental clinic — sterile, precise, and confident.

---

## Color Palette

All colors extracted directly from the official WDA SVG logo.

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--color-navy` | Deep Clinical Navy | `#1E3560` | Primary brand color, headings, nav, footer, structural elements |
| `--color-blue` | Modern Dental Blue | `#4A9FD4` | Accent, buttons, links, icons, H3 headings |
| `--color-white` | Pristine White | `#FFFFFF` | Page backgrounds |
| `--color-surface` | Soft Clinical Gray | `#F4F7F9` | Alternating sections, card backgrounds, input fields |
| `--color-text` | Charcoal Slate | `#2B303A` | Body copy |
| `--color-accent` | Coral Amber | `#E67E22` | High-conversion CTAs only — "Apply Now", "Book a Clinic Tour", urgent banners, notification badges |

### Tailwind CSS Variables (add to `globals.css`)
```css
@layer base {
  :root {
    --color-navy: #1E3560;
    --color-blue: #4A9FD4;
    --color-white: #FFFFFF;
    --color-surface: #F4F7F9;
    --color-text: #2B303A;
    --color-accent: #E67E22;
  }
}
```

---

## Typography

**Primary Font:** Montserrat (matches the logo exactly)
**Body Font:** Open Sans (clean, legible, complements Montserrat)

Import in `layout.tsx`:
```ts
import { Montserrat, Open_Sans } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['500', '600', '700'] })
const openSans = Open_Sans({ subsets: ['latin'], weight: ['400', '600'] })
```

### Type Scale
| Element | Font | Weight | Size | Color |
|---|---|---|---|---|
| H1 | Montserrat | 700 | 2.25rem (36px) | `#1E3560` |
| H2 | Montserrat | 600 | 1.75rem (28px) | `#1E3560` |
| H3 | Montserrat | 500 | 1.25rem (20px) | `#4A9FD4` |
| Body | Open Sans | 400 | 1rem (16px) | `#2B303A` |
| Body line-height | — | — | 1.6 | — |

---

## UI & Component Guidelines

### Buttons
- **Primary:** bg `#4A9FD4`, text white, bold, border-radius `8px`
- **Hover:** transition to `#1E3560`
- **Secondary:** outlined, border `#1E3560`, text `#1E3560`
- **Accent (CTA only):** bg `#E67E22`, text white — use exclusively for "Apply Now", "Book a Clinic Tour", and urgent actions. Never overuse; its power comes from scarcity.

### Cards & Containers
- Background: `#F4F7F9`
- Subtle box-shadow for depth (no heavy borders)
- Generous padding and whitespace

### Layout Philosophy
- Whitespace is a feature — do not crowd content
- Clean grid layouts, no clutter
- Consistent section padding: `py-16` or `py-24`
- Max content width: `max-w-6xl mx-auto`

### Logo Usage
- **Light backgrounds:** Full color SVG logo
- **Dark backgrounds (navy):** Logo text flipped to white `#FFFFFF`
- **Clear space:** Maintain margin equal to half the logo icon width on all sides
- Logo file: `WDA_Logo1.svg`

---

## Site Structure (Phase 1)

| Page | Route | Purpose |
|---|---|---|
| Home | `/` | Hero, overview, programs intro, CTA |
| About | `/about` | Mission, story, values, team |
| Programs | `/programs` | All dental assisting programs |
| Program Detail | `/programs/[slug]` | Individual program pages (Sanity) |
| Contact | `/contact` | Contact form, location, hours |
| Blog | `/blog` | SEO-driven articles written by WDA staff via Sanity |
| Blog Post | `/blog/[slug]` | Individual blog post pages (Sanity Portable Text) |
| FAQ | `/faq` | Frequently asked questions managed via Sanity |

> Phase 2 will add: Blog, Student Resources, Online Enrollment

---

## Sanity CMS Schema (planned)

- `program` — title, slug, description, duration, cost, image
- `teamMember` — name, role, bio, photo
- `testimonial` — quote, author, program
- `blogPost` — title, slug, publishedAt, author, mainImage, excerpt, body (Portable Text)
- `faqItem` — question, answer, category (e.g. Admissions, Programs, Cost, Career)

---

## Frontend Design Direction

When building UI components or pages, follow this aesthetic direction:

- **Style:** Refined minimalism. Clinical precision. Confident whitespace.
- **Avoid:** Purple gradients, generic AI aesthetics, overly decorative patterns
- **Motion:** Subtle scroll-triggered fade-ins, smooth hover transitions on buttons/cards
- **Imagery:** Use `#F4F7F9` surface backgrounds as placeholders until real photos are provided
- **Inspiration:** Modern healthcare/education sites — clean, authoritative, welcoming

This is a professional institution website. Every design decision should reinforce trust, credibility, and modernity.

---

## Design Philosophy (Frontend Skill)

Before building any UI component or page:

- **Commit to intentionality** — every design decision should feel deliberate, not default. Ask: does this look like it was made specifically for WDA, or does it look like a template?
- **Typography** — Montserrat is locked for headings per brand guidelines. Be intentional with pairing; Open Sans is the body font. Never fall back to system fonts (Arial, Roboto) outside the defined type scale.
- **Motion** — use purposefully. Scroll-triggered fade-ins, smooth hover transitions on buttons and cards. One well-orchestrated page load with staggered reveals creates more impact than scattered micro-interactions.
- **Atmosphere** — create depth with subtle gradients, soft shadows, and layered transparencies. Avoid flat, lifeless layouts.
- **Spatial composition** — generous negative space is a feature. Use asymmetry and grid-breaking moments where appropriate to avoid predictable layouts.
- **Color** — `#1E3560` dominates, `#4A9FD4` accents sharply. Don't distribute colors evenly — let navy anchor the structure and blue punctuate key moments.

### Never use:
- Generic purple gradients or unbranded color schemes
- Cookie-cutter hero/card patterns with no distinctive character
- Predictable, template-like layouts
- Overly decorative patterns that contradict the clean clinical tone
- Any font outside the defined type scale without explicit instruction

---

## SEO

Use the built-in Next.js Metadata API — no extra packages needed. Every page must have a `metadata` export.

### Default metadata (in `app/layout.tsx`)
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

### Per-page metadata example
```ts
export const metadata = {
  title: 'Dental Assisting Program',
  description: 'Learn about our dental assisting program — duration, cost, and start dates.',
}
```

### Required files in `/app`
- `sitemap.ts` — auto-generates sitemap.xml for Google indexing
- `robots.ts` — controls crawler access

### Target keywords (to weave into page copy and metadata)
- dental assistant training Edmonton
- dental assisting program Alberta
- dental academy Edmonton
- become a dental assistant Edmonton

---

## Google Analytics

Use `@next/third-parties` for GA4 integration.

### Install
```bash
npm install @next/third-parties
```

### Add to `app/layout.tsx`
```ts
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
    </html>
  )
}
```

### Environment variable
Add to `.env.local`:
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Also add to Vercel environment variables in the WDA project dashboard. Never hardcode the GA ID directly in the source.

---

## Development Notes

- Always use the App Router (`/app` directory)
- All Sanity content fetching via server components
- Images via `next/image` with proper sizing
- Mobile-first responsive design
- Accessibility: WCAG 2.1 AA minimum (proper contrast ratios, alt text, semantic HTML)
- Environment variables go in `.env.local` (never commit to GitHub)
- GA ID and Sanity tokens must also be added to Vercel environment variables

---

## Key Contacts

| Role | Name | Email |
|---|---|---|
| Developer | Aiden | aiden2@westerndentalacademy.com |