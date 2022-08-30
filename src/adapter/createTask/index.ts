import { authenticate, getDocumentTranslationMetadata } from '../helpers'
import createSubmission from './createSubmission'
import saveSubmission from './saveSubmission'
import uploadSource from './uploadSource'
import createOrUpdateMetadata from './createOrUpdateMetadata'
import { getTranslationTask } from '../getTranslationTask'
import { Secrets } from 'sanity-translations-tab'

const createTask = async (
  documentId: string,
  document: Record<string, any>,
  localeIds: string[],
  secrets: Secrets | null,
  workflowUid?: string
) => {
  const metadata = await getDocumentTranslationMetadata(documentId)
  //TODO: if a job exists for any of these locales, cancel it
  //This behavior should be required by GlobalLink certification
  if (metadata) {
  }

  if (!secrets) {
    throw Error('No secrets provided. Please check plugin readme.')
  }

  const token = await authenticate(secrets)
  const submissionId = await createSubmission(
    documentId,
    secrets.project,
    localeIds,
    token,
    workflowUid
  )
  await uploadSource(documentId, document, token, submissionId)

  const submissionStatus = await saveSubmission(token, submissionId)
  console.log('submissionStatus', submissionStatus)

  await createOrUpdateMetadata(submissionId, documentId, localeIds)
  return getTranslationTask(documentId, secrets)
}

export default createTask
