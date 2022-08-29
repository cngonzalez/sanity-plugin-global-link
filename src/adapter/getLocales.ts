import { globalLinkProxy, authenticate, baseUrl } from './helpers'
import { Secrets } from 'sanity-translations-tab'

export const getLocales = async (secrets: Secrets | null) => {
  if (!secrets) {
    return []
  }
  const token = await authenticate(secrets)
  const { project } = secrets
  const headers = {
    authorization: `Bearer ${token}`,
    'X-URL': `${baseUrl}/rest/v0/projects/${project}`,
  }
  const locales = await fetch(globalLinkProxy, { headers })
    .then(res => res.json())
    .then(res =>
      res.projectLanguageDirections.map(direction => ({
        localeId: direction.targetLanguage,
        description: direction.targetLanguageDisplayName,
      }))
    )
  return locales
}
