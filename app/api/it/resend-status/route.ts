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
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
    })
    const ms = Math.round(performance.now() - t0)
    const isUp = response.status === 200 || response.status === 405 || response.status === 400
    if (isUp) return Response.json({ ok: true, ms, detail: 'API reachable' })
    return Response.json({ ok: false, ms, detail: `HTTP ${response.status}` })
  } catch (err: unknown) {
    const ms = Math.round(performance.now() - t0)
    const message = err instanceof Error ? err.message : 'Request failed'
    return Response.json({ ok: false, ms, detail: message })
  }
}
