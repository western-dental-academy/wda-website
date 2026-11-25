import { sendPolicyEmails } from '@/lib/staff/policies'

// Daily at 9 AM Alberta (15:00 UTC):
//   every day  → email staff about any newly activated policy or new version
//   Mondays    → remind anyone who still has an unsigned policy
// Add ?dry=1 to see who would be emailed without sending anything.
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const dryRun = url.searchParams.get('dry') === '1'
  const isMonday = new Date().getUTCDay() === 1

  try {
    const result = await sendPolicyEmails({ newPolicies: true, reminders: isMonday, dryRun })
    return Response.json({ ok: true, dryRun, isMonday, ...result })
  } catch (err) {
    console.error('[policy-reminders]', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
