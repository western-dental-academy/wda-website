import { auth, currentUser } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe/client'

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
    const balance = await stripe.balance.retrieve()
    const ms = Math.round(performance.now() - t0)
    const cad = balance.available.find(b => b.currency === 'cad')
    const detail = cad != null
      ? `$${(cad.amount / 100).toFixed(2)} CAD available`
      : 'Connected'
    return Response.json({ ok: true, ms, detail })
  } catch (err: unknown) {
    const ms = Math.round(performance.now() - t0)
    const message = err instanceof Error ? err.message : 'Request failed'
    return Response.json({ ok: false, ms, detail: message })
  }
}
