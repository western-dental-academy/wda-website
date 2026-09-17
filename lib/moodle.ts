const MOODLE_URL = 'https://learn.westerndentalacademy.com/webservice/rest/server.php'
const STUDENT_ROLE_ID = 5

function moodleToken(): string {
  const token = process.env.MOODLE_TOKEN
  if (!token) throw new Error('MOODLE_TOKEN env var is not set')
  return token
}

async function moodlePost(wsfunction: string, params: Record<string, string>): Promise<unknown> {
  const body = new URLSearchParams({
    wstoken: moodleToken(),
    wsfunction,
    moodlewsrestformat: 'json',
    ...params,
  })

  const res = await fetch(MOODLE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    cache: 'no-store',
  })

  if (!res.ok) throw new Error(`Moodle HTTP ${res.status}: ${await res.text()}`)

  const data = await res.json()
  if (data && typeof data === 'object' && 'exception' in data) {
    throw new Error(`Moodle error (${(data as any).errorcode}): ${(data as any).message}`)
  }

  return data
}

function moodleUsername(email: string): string {
  return email
    .toLowerCase()
    .replace(/@/, '.')
    .replace(/[^a-z0-9._-]/g, '')
    .substring(0, 100)
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let pwd = ''
  for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)]
  return `Wda${pwd}!9`
}

// ── Public helpers ────────────────────────────────────────────────────────────

export async function getOrCreateMoodleUser(
  email: string,
  firstName: string,
  lastName: string
): Promise<number> {
  // Try to find existing user by email
  const existing = await moodlePost('core_user_get_users', {
    'criteria[0][key]': 'email',
    'criteria[0][value]': email,
  }) as { users: Array<{ id: number }> }

  if (existing.users && existing.users.length > 0) {
    return existing.users[0].id
  }

  // Create new user
  const username = moodleUsername(email)
  const created = await moodlePost('core_user_create_users', {
    'users[0][username]': username,
    'users[0][password]': generatePassword(),
    'users[0][firstname]': firstName,
    'users[0][lastname]': lastName,
    'users[0][email]': email,
    'users[0][auth]': 'manual',
    'users[0][preferences][0][type]': 'auth_forcepasswordchange',
    'users[0][preferences][0][value]': '1',
  }) as Array<{ id: number }>

  if (!created || created.length === 0) {
    throw new Error('Moodle user creation returned empty result')
  }

  // Send password reset email so the learner can set their own password
  try {
    await moodlePost('core_auth_request_password_reset', { email })
  } catch {
    // Non-fatal — learner can use "Forgot Password" on Moodle
  }

  return created[0].id
}

export async function enrollUserInCourse(
  moodleUserId: number,
  moodleCourseId: number,
  accessExpiresAt: Date
): Promise<void> {
  await moodlePost('enrol_manual_enrol_users', {
    'enrolments[0][roleid]': String(STUDENT_ROLE_ID),
    'enrolments[0][userid]': String(moodleUserId),
    'enrolments[0][courseid]': String(moodleCourseId),
    'enrolments[0][timeend]': String(Math.floor(accessExpiresAt.getTime() / 1000)),
    'enrolments[0][suspend]': '0',
  })
}

export async function suspendUserEnrollment(
  moodleUserId: number,
  moodleCourseId: number
): Promise<void> {
  await moodlePost('enrol_manual_enrol_users', {
    'enrolments[0][roleid]': String(STUDENT_ROLE_ID),
    'enrolments[0][userid]': String(moodleUserId),
    'enrolments[0][courseid]': String(moodleCourseId),
    'enrolments[0][suspend]': '1',
  })
}

export async function reactivateUserEnrollment(
  moodleUserId: number,
  moodleCourseId: number,
  newAccessExpiresAt: Date
): Promise<void> {
  await moodlePost('enrol_manual_enrol_users', {
    'enrolments[0][roleid]': String(STUDENT_ROLE_ID),
    'enrolments[0][userid]': String(moodleUserId),
    'enrolments[0][courseid]': String(moodleCourseId),
    'enrolments[0][timeend]': String(Math.floor(newAccessExpiresAt.getTime() / 1000)),
    'enrolments[0][suspend]': '0',
  })
}
