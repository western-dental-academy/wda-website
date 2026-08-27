import { auth, currentUser } from '@clerk/nextjs/server'
import { Resend } from 'resend'

const IT_EMAIL = 'aiden@westerndentalacademy.com'
const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await currentUser()
  if (user?.emailAddresses[0]?.emailAddress !== IT_EMAIL) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const t0 = performance.now()
  try {
    const { data, error } = await resend.domains.list()
    const ms = Math.round(performance.now() - t0)
    if (error) return Response.json({ ok: false, ms, detail: error.message })
    const verified = (data?.data ?? []).filter((d: { status: string }) => d.status === 'verified').length
    const total    = (data?.data ?? []).length
    return Response.json({ ok: true, ms, detail: `${verified}/${total} domain(s) verified` })
  } catch (err: unknown) {
    const ms = Math.round(performance.now() - t0)
    const message = err instanceof Error ? err.message : 'Request failed'
    return Response.json({ ok: false, ms, detail: message })
  }
}
