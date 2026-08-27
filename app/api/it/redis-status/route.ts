import { auth, currentUser } from '@clerk/nextjs/server'
import { Redis } from '@upstash/redis'

const IT_EMAIL = 'aiden@westerndentalacademy.com'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await currentUser()
  if (user?.emailAddresses[0]?.emailAddress !== IT_EMAIL) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })

  const t0 = performance.now()
  try {
    const pong = await redis.ping()
    const ms = Math.round(performance.now() - t0)
    return Response.json({ ok: pong === 'PONG', ms, detail: 'PONG received' })
  } catch (err: unknown) {
    const ms = Math.round(performance.now() - t0)
    const message = err instanceof Error ? err.message : 'Request failed'
    return Response.json({ ok: false, ms, detail: message })
  }
}
