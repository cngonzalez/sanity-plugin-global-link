import {
  authenticate,
  baseUrl,
  getDocumentTranslationMetadata,
  globalLinkProxy,
} from './helpers'
import { Secrets } from 'sanity-translations-tab'

export const getTranslationTask = async (
  documentId: string,
  secrets: Secrets | null
) => {
  if (!documentId) {
    return {
      taskId: documentId,
      documentId,
      locales: [],
    }
  }
  if (!secrets) { 
    throw Error('No secrets provided. Please check plugin readme.')
  }
  const token = await authenticate(secrets)
  const metadata = await getDocumentTranslationMetadata(documentId)

  if (!metadata || !metadata.jobs || !Object.values(metadata.jobs).length) {
    return {
      taskId: documentId,
      documentId,
      locales: [],
    }
  }

  const submissionIds = Object.values(metadata.jobs)

  const url = `${baseUrl}/rest/v0/targets?submissionIds=${submissionIds.join(
    ','
  )}`

  const headers = {
    authorization: `Bearer ${token}`,
    'X-URL': url,
  }

  let locales = await fetch(globalLinkProxy, { headers })
    .then(res => res.json())
    .then(res =>
      res.map(target => ({
        localeId: target.targetLanguage,
        progress: target.status === 'PROCESSED' ? 100 : 50,
      }))
    )

  return {
    taskId: documentId,
    documentId,
    locales,
  }
}
