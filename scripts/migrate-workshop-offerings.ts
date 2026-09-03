/**
 * migrate-workshop-offerings.ts
 *
 * One-time migration: splits workshopDate into workshopOffering + workshopDate.
 *
 * For each unique workshop name in existing workshopDate docs:
 *   1. Create a workshopOffering document with all static fields
 *   2. Patch each workshopDate to add an `offering` reference and unset old fields
 *
 * Usage:
 *   DRY_RUN = true  → logs what would happen, writes nothing
 *   DRY_RUN = false → actually writes to Sanity production
 *
 * Run with:
 *   npx tsx scripts/migrate-workshop-offerings.ts
 */

import 'dotenv/config'
import { createClient } from '@sanity/client'

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const DRY_RUN = true // ← change to false to actually write

const client = createClient({
  projectId: 'p8yox22i',
  dataset: 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

// ─── CPP/hours metadata from lib/workshops/offerings.ts ─────────────────────

const OFFERING_METADATA: Record<string, { hours?: number; cadaCppCodes?: string[] }> = {
  'Ergonomics in Dentistry: Move Well, Breathe Well, Practice Longer': {
    hours: 1.5,
    cadaCppCodes: ['B-4-2', 'I-5-3', 'I-5-4'],
  },
  'Ergonomics in Dentistry: Hands, Feet and Spine': {
    hours: 1.5,
    cadaCppCodes: ['B-4-2', 'I-5-3', 'I-5-4'],
  },
  'Ergonomics in Dentistry: Hips and Hamstrings': {
    hours: 1.5,
    cadaCppCodes: ['B-4-2', 'I-5-3', 'I-5-4'],
  },
  'Ergonomics in Dentistry: Neck and Shoulders': {
    hours: 1.5,
    cadaCppCodes: ['B-4-2', 'I-5-3', 'I-5-4'],
  },
  'National Board Guided Practice Workshop': {
    hours: 8,
  },
  'Renewal Wellness Workshop': {
    hours: 6.25,
    cadaCppCodes: ['I-2-1', 'D-3-1', 'I-5-4', 'B-5-3'],
  },
}

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface OldWorkshopDate {
  _id: string
  workshop?: string          // old name field
  date: string
  capacity?: number
  category?: string
  hasVirtualOption?: boolean
  virtualPrice?: number
  active?: boolean
  feedbackEnabled?: boolean
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n=== Workshop Offering Migration (DRY_RUN=${DRY_RUN}) ===\n`)

  if (!process.env.SANITY_API_TOKEN) {
    console.error('ERROR: SANITY_API_TOKEN is not set. Add it to .env.local and try again.')
    process.exit(1)
  }

  // 1. Fetch all existing workshopDate documents
  const dates = await client.fetch<OldWorkshopDate[]>(
    `*[_type == "workshopDate"]{ _id, workshop, date, capacity, category, hasVirtualOption, virtualPrice, active, feedbackEnabled }`
  )
  console.log(`Found ${dates.length} workshopDate document(s).`)

  if (dates.length === 0) {
    console.log('Nothing to migrate.')
    return
  }

  // 2. Group by unique workshop name
  const grouped = new Map<string, OldWorkshopDate[]>()
  for (const d of dates) {
    const name = d.workshop ?? '(unknown)'
    const group = grouped.get(name) ?? []
    group.push(d)
    grouped.set(name, group)
  }

  console.log(`\nFound ${grouped.size} unique offering(s):`)
  for (const [name, docs] of grouped) {
    console.log(`  • "${name}" — ${docs.length} date(s)`)
  }
  console.log('')

  // 3. For each unique name, create a workshopOffering and patch the dates
  const offeringIdMap = new Map<string, string>() // name → new offering _id

  for (const [name, docs] of grouped) {
    // Use the first date's metadata as representative
    const representative = docs[0]
    const meta = OFFERING_METADATA[name] ?? {}

    const offeringDoc = {
      _type: 'workshopOffering',
      title: name,
      category: representative.category ?? 'workshop',
      ...(representative.capacity   != null ? { capacity: representative.capacity }          : {}),
      ...(representative.hasVirtualOption     ? { hasVirtualOption: true }                   : { hasVirtualOption: false }),
      ...(representative.virtualPrice != null ? { virtualPrice: representative.virtualPrice } : {}),
      ...(meta.hours      != null ? { hours: meta.hours }           : {}),
      ...(meta.cadaCppCodes       ? { cadaCppCodes: meta.cadaCppCodes } : {}),
    }

    console.log(`Creating workshopOffering for "${name}":`)
    console.log('  ', JSON.stringify(offeringDoc, null, 2).replace(/\n/g, '\n   '))

    let createdId: string
    if (DRY_RUN) {
      createdId = `dry-run-offering-${name.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}`
      console.log(`  [DRY RUN] Would create → id: ${createdId}`)
    } else {
      const created = await client.create(offeringDoc)
      createdId = created._id
      console.log(`  Created → id: ${createdId}`)
    }

    offeringIdMap.set(name, createdId)

    // 4. Patch each workshopDate for this offering
    for (const d of docs) {
      console.log(`  Patching workshopDate ${d._id} (date: ${d.date.slice(0, 10)})`)
      if (DRY_RUN) {
        console.log(`    [DRY RUN] Would set offering ref → ${createdId}`)
        console.log(`    [DRY RUN] Would unset: workshop, capacity, category, hasVirtualOption, virtualPrice`)
      } else {
        await client
          .patch(d._id)
          .set({ offering: { _type: 'reference', _ref: createdId } })
          .unset(['workshop', 'capacity', 'category', 'hasVirtualOption', 'virtualPrice'])
          .commit()
        console.log(`    ✓ Patched ${d._id}`)
      }
    }

    console.log('')
  }

  if (DRY_RUN) {
    console.log('=== DRY RUN complete — no changes were written. ===')
    console.log('Set DRY_RUN = false and run again to apply the migration.')
  } else {
    console.log('=== Migration complete. ===')
    console.log('Next: open Sanity Studio and verify Workshop Offerings and Workshop Dates look correct.')
  }
}

main().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
