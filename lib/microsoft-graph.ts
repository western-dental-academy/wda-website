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

export async function createCalendarEvent({
  calendarEmail,
  subject,
  start,
  end,
  isAllDay = false,
  body,
}: {
  calendarEmail: string
  subject: string
  start: string
  end: string
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
      start: {
        dateTime: start,
        timeZone: 'America/Edmonton',
      },
      end: {
        dateTime: end,
        timeZone: 'America/Edmonton',
      },
      isAllDay,
    }

    await graphClient
      .api(`/users/${calendarEmail}/calendar/events`)
      .post(event)

    return { success: true }
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
