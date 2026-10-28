import { NextRequest } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@sanity/client'

const ADMIN_EMAILS = [
  'aiden@westerndentalacademy.com',
  'lance@westerndentalacademy.com',
  'ryan@westerndentalacademy.com',
  'jolene@westerndentalacademy.com',
  'alana@westerndentalacademy.com',
  'collette@westerndentalacademy.com',
  'amber@westerndentalacademy.com',
  'tammy@westerndentalacademy.com',
]

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const FULL = `{ _id, title, platform, entriesText, maxEntries, exclude, removed, draws, _createdAt }`

async function staff() {
  const { userId } = await auth()
  if (!userId) return null
  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''
  if (!ADMIN_EMAILS.includes(email)) return null
  return `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || email
}

// GET: list of draws, or one full draw with ?id=
export async function GET(req: NextRequest) {
  if (!(await staff())) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const id = req.nextUrl.searchParams.get('id')
  if (id) {
    const draw = await client.fetch(`*[_type == "giveawayDraw" && _id == $id && !(_id in path("drafts.**"))][0]${FULL}`, { id })
    if (!draw) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json({ draw })
  }
  const draws = await client.fetch(
    `*[_type == "giveawayDraw" && !(_id in path("drafts.**"))] | order(_createdAt desc) { _id, title, platform, _createdAt, "winners": count(draws) }`
  )
  return Response.json({ draws })
}

// POST { title }: start a new draw
export async function POST(req: NextRequest) {
  const name = await staff()
  if (!name) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => ({}))
  const title = typeof body.title === 'string' ? body.title.trim().slice(0, 120) : ''
  if (!title) return Response.json({ error: 'Give the draw a name' }, { status: 400 })
  const platform = body.platform === 'fb' ? 'fb' : 'ig'
  const created = await client.create({
    _type: 'giveawayDraw', title, platform, entriesText: '', maxEntries: 5,
    exclude: 'westerndentalacademy', removed: [], draws: [], createdBy: name,
  })
  const draw = await client.fetch(`*[_id == $id][0]${FULL}`, { id: created._id })
  return Response.json({ draw })
}

// PATCH { id, entriesText?, platform?, maxEntries?, exclude?, removed?, addDraw? }: autosave and winners
export async function PATCH(req: NextRequest) {
  const name = await staff()
  if (!name) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => ({}))
  if (typeof body.id !== 'string' || !body.id || body.id.startsWith('drafts.')) {
    return Response.json({ error: 'Missing draw id' }, { status: 400 })
  }
  const exists = await client.fetch(`count(*[_type == "giveawayDraw" && _id == $id])`, { id: body.id })
  if (!exists) return Response.json({ error: 'Not found' }, { status: 404 })

  const set: Record<string, unknown> = {}
  if (typeof body.title === 'string' && body.title.trim()) set.title = body.title.trim().slice(0, 120)
  if (typeof body.entriesText === 'string') set.entriesText = body.entriesText.slice(0, 500_000)
  if (body.platform === 'ig' || body.platform === 'fb') set.platform = body.platform
  if (Number.isFinite(body.maxEntries)) set.maxEntries = Math.min(50, Math.max(1, Math.round(body.maxEntries)))
  if (typeof body.exclude === 'string') set.exclude = body.exclude.slice(0, 2000)
  if (Array.isArray(body.removed)) set.removed = body.removed.filter((s: unknown) => typeof s === 'string').slice(0, 500)

  let patch = client.patch(body.id).set(set)
  const d = body.addDraw
  if (d && typeof d.name === 'string') {
    patch = patch.setIfMissing({ draws: [] }).append('draws', [{
      _key: crypto.randomUUID().replace(/-/g, '').slice(0, 12),
      at: String(d.at ?? '').slice(0, 60), name: d.name.slice(0, 100),
      ball: Number(d.ball) || 0, of: Number(d.of) || 0, drawnBy: name,
    }])
  }
  await patch.commit()
  return Response.json({ ok: true })
}
