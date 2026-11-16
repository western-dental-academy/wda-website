import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { renderIssuePreview, sendTestIssue } from '@/lib/newsletter/send'
import { fillSpotlightFromPost } from '@/lib/newsletter/social'

// Staff-only newsletter tools, used by the buttons on a Newsletter in the Studio.
//   GET  ?id=<newsletter id>         the email as subscribers will see it (drafts included)
//   POST { id }                      emails a [TEST] copy to the signed-in staff member
//   POST { id, action: 'fillPost' }  fills behind-the-scenes from its social post link

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

async function staff(): Promise<{ email: string; firstName?: string } | NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Sign in to the website first (westerndentalacademy.com/sign-in), then try again.' }, { status: 401 })
  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress?.toLowerCase() ?? ''
  if (!ADMIN_EMAILS.includes(email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return { email, firstName: user?.firstName ?? undefined }
}

export async function GET(req: NextRequest) {
  const who = await staff()
  if (who instanceof NextResponse) return who
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const preview = await renderIssuePreview(id, req.nextUrl.searchParams.get('name') ?? undefined)
  if (!preview) return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 })
  if (req.nextUrl.searchParams.get('format') === 'text') {
    return new NextResponse(preview.text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }
  return new NextResponse(preview.html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

export async function POST(req: NextRequest) {
  const who = await staff()
  if (who instanceof NextResponse) return who
  let id: string | undefined
  let action: string | undefined
  try { ({ id, action } = await req.json() as { id?: string; action?: string }) } catch { /* handled below */ }
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  if (action === 'fillPost') {
    const result = await fillSpotlightFromPost(id)
    if (!result) return NextResponse.json({ error: 'Paste a social post link into "Behind the scenes" first (and wait a second for it to save).' }, { status: 400 })
    return NextResponse.json({ success: true, ...result })
  }
  try {
    const result = await sendTestIssue(id, who.email, who.firstName)
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    return NextResponse.json({ error: String(err instanceof Error ? err.message : err) }, { status: 500 })
  }
}
