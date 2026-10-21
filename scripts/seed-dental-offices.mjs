// Loads the outreach dental office list into Sanity (idempotent: stable _ids, createOrReplace).
// Usage: node scripts/seed-dental-offices.mjs  (reads SANITY_API_TOKEN from .env.local)
import { createClient } from '@sanity/client'
import fs from 'node:fs'

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter(l => /^[A-Z0-9_]+=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')] })
)

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'p8yox22i',
  dataset: env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  token: env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const offices = JSON.parse(fs.readFileSync('scripts/data/dental-offices-seed.json', 'utf8'))
const tx = client.transaction()
for (const o of offices) tx.createOrReplace(o)
const res = await tx.commit()
console.log(`Loaded ${offices.length} dental offices (${res.results.length} mutations)`)
