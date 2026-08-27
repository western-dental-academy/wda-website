import { auth, currentUser } from '@clerk/nextjs/server'

const IT_EMAIL = 'aiden@westerndentalacademy.com'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await currentUser()
  if (user?.emailAddresses[0]?.emailAddress !== IT_EMAIL) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const t0 = performance.now()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)

  try {
    const res = await fetch('https://westerndentalacademy.com', {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    })
    clearTimeout(timer)
    const ms = Math.round(performance.now() - t0)
    return Response.json({ ok: res.ok, ms, detail: `HTTP ${res.status}` })
  } catch {
    clearTimeout(timer)
    const ms = Math.round(performance.now() - t0)
    return Response.json({ ok: false, ms, detail: 'Connection failed' })
  }
}
