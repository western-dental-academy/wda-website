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
