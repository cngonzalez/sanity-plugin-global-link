import { Secrets } from 'sanity-translations-tab'
//@ts-ignore
import sanityClient from 'part:@sanity/base/client'

export const globalLinkProxy = process.env.SANITY_STUDIO_GLOBALLINK_PROXY || ""
const client = sanityClient.withConfig({ apiVersion: '2021-10-21' })

//TO ASK: is this going to be constant for all users?
export const baseUrl = `https://gl-connect8.translations.com/PD`

export const authenticate = async (secrets: Secrets): Promise<string> => {
  const { token, username, password } = secrets
  const headers = {
    authorization: `Basic ${token}`,
    'X-URL': `${baseUrl}/oauth/token`,
  }

  const body = new FormData()
  body.append('grant_type', 'password')
  body.append('username', username as string)
  body.append('password', password as string)

  const accessToken = await fetch(globalLinkProxy, {
    method: 'POST',
    headers,
    body,
  })
    .then(res => res.json())
    //TODO also grab refresh token, keep them both in store
    .then(res => res.access_token)

  return accessToken
}

export const getHeaders = (url: string, accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
  'X-URL': url,
})

export const getDocumentTranslationMetadata = async (documentId: string) => {
  return client.fetch(`*[_id == 'globalLink-metadata.${documentId}'][0]`)
}
