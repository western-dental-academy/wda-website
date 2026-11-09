import { runWorkshopReminders } from '@/lib/workshops/reminders'

// Daily at 15:00 UTC (9 AM Alberta time). Schedules every workshop reminder
// due in the next ~26 hours with Resend; see lib/workshops/reminders.ts.
// Add ?dryRun=1 to see what would be sent without sending anything.
export const maxDuration = 60

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const dryRun = new URL(req.url).searchParams.get('dryRun') === '1'
  try {
    const result = await runWorkshopReminders({ dryRun })
    return Response.json({
      success: true,
      dryRun,
      planned: result.planned.length,
      sent: result.sent,
      failed: result.failed,
      teamsIssues: result.teamsIssues,
      reminders: result.planned.map(p => ({
        name: p.name, workshop: p.workshop, delivery: p.delivery,
        kind: p.kind, eventStart: p.eventStart, sendAt: p.sendAt,
      })),
    })
  } catch (error) {
    console.error('Workshop reminders cron error:', error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
