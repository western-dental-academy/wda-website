import { ClientSecretCredential } from '@azure/identity'
import { Client } from '@microsoft/microsoft-graph-client'
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'

const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID!,
  process.env.AZURE_CLIENT_ID!,
  process.env.AZURE_CLIENT_SECRET!
)

const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ['https://graph.microsoft.com/.default'],
})

export const graphClient = Client.initWithMiddleware({ authProvider })

// Staff invited to every site-created calendar event (workshop dates, approved
// time off). Same pattern Jolene uses: one invite per person, so the event lands
// in everyone's own Outlook calendar.
export const STAFF_CALENDAR_INVITEES = [
  'aiden@westerndentalacademy.com',
  'lance@westerndentalacademy.com',
  'ryan@westerndentalacademy.com',
  'jolene@westerndentalacademy.com',
  'alana@westerndentalacademy.com',
  'collette@westerndentalacademy.com',
  'tammy@westerndentalacademy.com',
]

// Mailbox that sends the invites. WDAteamsite is a Microsoft 365 group and can't
// be written to through /users/, so a real user mailbox organises them.
const CALENDAR_ORGANIZER =
  process.env.CALENDAR_ORGANIZER_EMAIL ?? 'aiden@westerndentalacademy.com'

export async function createCalendarEvent({
  subject,
  start,
  end,
  timeZone = 'America/Edmonton',
  isAllDay = false,
  body,
}: {
  subject: string
  start: string
  end: string
  timeZone?: string
  isAllDay?: boolean
  body?: string
}) {
  try {
    const event = {
      subject,
      body: {
        contentType: 'text',
        content: body ?? '',
      },
      start: { dateTime: start, timeZone },
      end:   { dateTime: end,   timeZone },
      isAllDay,
      showAs: 'free',
      responseRequested: false,
      attendees: STAFF_CALENDAR_INVITEES
        .filter(address => address !== CALENDAR_ORGANIZER)
        .map(address => ({ emailAddress: { address }, type: 'optional' })),
    }

    const response = await graphClient
      .api(`/users/${CALENDAR_ORGANIZER}/calendar/events`)
      .post(event)

    return { success: true, eventId: response.id as string | undefined }
  } catch (error: unknown) {
    console.error('Calendar event creation error:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function registerTeamsWebinarAttendee({
  webinarId,
  firstName,
  lastName,
  email,
}: {
  webinarId: string
  firstName: string
  lastName: string
  email: string
}) {
  try {
    const response = await graphClient
      .api(`/solutions/virtualEvents/webinars/${webinarId}/registrations`)
      .post({
        firstName,
        lastName,
        email,
      })
    return { success: true, registrationId: response.id as string, joinUrl: response.joinWebUrl as string }
  } catch (error: unknown) {
    console.error('Teams webinar registration error:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
