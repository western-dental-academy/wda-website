const MOODLE_URL = process.env.MOODLE_URL!
const MOODLE_TOKEN = process.env.MOODLE_TOKEN!

export async function moodleRequest(
  wsfunction: string,
  params: Record<string, unknown> = {}
) {
  const url = new URL(`${MOODLE_URL}/webservice/rest/server.php`)
  url.searchParams.set('wstoken', MOODLE_TOKEN)
  url.searchParams.set('moodlewsrestformat', 'json')
  url.searchParams.set('wsfunction', wsfunction)

  const body = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    body.append(key, String(value))
  }

  const res = await fetch(url.toString(), {
    method: 'POST',
    body,
    cache: 'no-store',
  })

  const data = await res.json()

  if (data?.exception) {
    throw new Error(`Moodle API error [${wsfunction}]: ${data.message}`)
  }

  return data
}

// ── User functions ──────────────────────────────────────────

export async function createMoodleUser(user: {
  username: string
  password: string
  firstname: string
  lastname: string
  email: string
}) {
  return moodleRequest('core_user_create_users', {
    'users[0][username]': user.username,
    'users[0][password]': user.password,
    'users[0][firstname]': user.firstname,
    'users[0][lastname]': user.lastname,
    'users[0][email]': user.email,
  })
}

export async function updateMoodleUser(moodleUserId: number, fields: {
  suspended?: number
  email?: string
  firstname?: string
  lastname?: string
}) {
  const params: Record<string, unknown> = {
    'users[0][id]': moodleUserId,
  }
  if (fields.suspended !== undefined) params['users[0][suspended]'] = fields.suspended
  if (fields.email) params['users[0][email]'] = fields.email
  if (fields.firstname) params['users[0][firstname]'] = fields.firstname
  if (fields.lastname) params['users[0][lastname]'] = fields.lastname

  return moodleRequest('core_user_update_users', params)
}

// ── Enrolment functions ─────────────────────────────────────

export async function enrolMoodleUser(
  moodleUserId: number,
  moodleCourseId: number,
  roleId: number = 5
) {
  try {
    return await moodleRequest('enrol_manual_enrol_users', {
      'enrolments[0][roleid]': roleId,
      'enrolments[0][userid]': moodleUserId,
      'enrolments[0][courseid]': moodleCourseId,
      'enrolments[0][timestart]': Math.floor(Date.now() / 1000),
    })
  } catch (error) {
    // Moodle throws a "Message was not sent" error when no mail server
    // is configured, but the enrolment succeeds regardless. Safe to ignore.
    if (String(error).includes('Message was not sent')) return null
    throw error
  }
}

// ── Progress & grades ───────────────────────────────────────

export async function getMoodleProgress(
  moodleUserId: number,
  moodleCourseId: number
) {
  return moodleRequest('core_completion_get_activities_completion_status', {
    courseid: moodleCourseId,
    userid: moodleUserId,
  })
}

export async function getMoodleGrades(
  moodleUserId: number,
  moodleCourseId: number
) {
  return moodleRequest('gradereport_user_get_grade_items', {
    courseid: moodleCourseId,
    userid: moodleUserId,
  })
}

// ── Courses ─────────────────────────────────────────────────

export async function getMoodleCourses() {
  return moodleRequest('core_course_get_courses')
}
export async function getMoodleCourseContents(moodleCourseId: number) {
  return moodleRequest('core_course_get_contents', {
    courseid: moodleCourseId,
  })
}

export async function addUserToMoodleCohort(
  moodleUserId: number,
  cohortIdNumber: string
) {
  // First get the cohort ID from the ID number
  const cohorts = await moodleRequest('core_cohort_get_cohorts', {
    'cohortids[0]': 0,
  })

  // Find cohort by idnumber
  const cohort = cohorts?.find((c: any) => c.idnumber === cohortIdNumber)
  if (!cohort) {
    console.error(`Cohort not found: ${cohortIdNumber}`)
    return null
  }

  return moodleRequest('core_cohort_add_cohort_members', {
    'members[0][cohorttype][type]': 'id',
    'members[0][cohorttype][value]': cohort.id,
    'members[0][usertype][type]': 'id',
    'members[0][usertype][value]': moodleUserId,
  })
}

export async function getMoodleAssignments(moodleCourseId: number) {
  return moodleRequest('mod_assign_get_assignments', {
    'courseids[0]': moodleCourseId,
  })
}

export async function getMoodleSubmissions(assignmentIds: number[]) {
  const params: Record<string, unknown> = {}
  assignmentIds.forEach((id, i) => {
    params[`assignmentids[${i}]`] = id
  })
  return moodleRequest('mod_assign_get_submissions', params)
}