import { NextRequest } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

const IT_EMAIL = 'aiden@westerndentalacademy.com'

async function requireIT() {
  const { userId } = await auth()
  if (!userId) return null
  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''
  return email === IT_EMAIL ? email : null
}

export async function GET() {
  const ok = await requireIT()
  if (!ok) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const maintenance = process.env.MAINTENANCE_MODE === 'true'
  return Response.json({ maintenance })
}

export async function POST(req: NextRequest) {
  const ok = await requireIT()
  if (!ok) return Response.json({ error: 'Forbidden' }, { status: 403 })

  let body: unknown
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { enable } = body as { enable?: boolean }
  if (typeof enable !== 'boolean') {
    return Response.json({ error: 'enable must be a boolean' }, { status: 400 })
  }

  const newValue = enable ? 'true' : 'false'

  // Update the MAINTENANCE_MODE env var on Vercel
  const updateRes = await fetch(
    `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/env/${process.env.VERCEL_MAINTENANCE_ENV_ID}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value: newValue }),
    }
  )

  if (!updateRes.ok) {
    const errData = await updateRes.json().catch(() => ({})) as { error?: { message?: string } }
    return Response.json(
      { error: errData.error?.message ?? `Vercel API error: ${updateRes.status}` },
      { status: 502 }
    )
  }

  // Trigger a redeployment to apply the new env var
  let deploymentTriggered = false
  const repoId = process.env.VERCEL_REPO_ID

  if (repoId) {
    const deployRes = await fetch(`https://api.vercel.com/v13/deployments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'wda-website',
        gitSource: {
          type: 'github',
          repoId,
          ref: 'main',
        },
      }),
    })
    deploymentTriggered = deployRes.ok
    if (!deployRes.ok) {
      console.error('Vercel redeployment failed:', await deployRes.text().catch(() => ''))
    }
  }

  return Response.json({ ok: true, maintenance: enable, deploymentTriggered })
}
