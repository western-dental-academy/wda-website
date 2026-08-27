import { auth, currentUser } from '@clerk/nextjs/server'

const IT_EMAIL = 'aiden@westerndentalacademy.com'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await currentUser()
  if (user?.emailAddresses[0]?.emailAddress !== IT_EMAIL) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset  = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'

  if (!projectId) return Response.json({ ok: false, ms: 0, detail: 'Project ID not configured' })

  const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=*%5B0%5D`
  const t0 = performance.now()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)

  try {
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    const ms = Math.round(performance.now() - t0)
    if (!res.ok) return Response.json({ ok: false, ms, detail: `HTTP ${res.status}` })
    const data = await res.json()
    const docType = data?.result?._type ?? null
    return Response.json({ ok: true, ms, detail: docType ? `Dataset: ${dataset}` : `Dataset: ${dataset}` })
  } catch {
    clearTimeout(timer)
    const ms = Math.round(performance.now() - t0)
    return Response.json({ ok: false, ms, detail: 'Connection failed' })
  }
}
