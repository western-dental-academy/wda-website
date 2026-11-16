import { runNewsletters } from '@/lib/newsletter/send'

// Daily at 15:00 UTC (9 AM Alberta time). Queues any newsletter issue that is
// published, ticked "Ready to send" and due within 24 hours; Resend delivers it
// at the exact send time. See lib/newsletter/send.ts.
// Add ?dryRun=1 to see what would happen without sending anything.
export const maxDuration = 300

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const dryRun = new URL(req.url).searchParams.get('dryRun') === '1'
  try {
    const result = await runNewsletters({ dryRun })
    return Response.json({ success: true, dryRun, ...result })
  } catch (error) {
    console.error('Newsletter cron error:', error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
