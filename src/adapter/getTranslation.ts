import {
  globalLinkProxy,
  baseUrl,
  authenticate,
  getDocumentTranslationMetadata,
} from './helpers'
import { Secrets } from 'sanity-translations-tab'
var JSZip = require('jszip')

export const getTranslation = async (
  taskId: string,
  localeId: string,
  secrets: Secrets | null
) => {
  
  if (!secrets) { 
    throw Error('No secrets provided. Please check plugin readme.')
  }

  const token = await authenticate(secrets)
  const metadata = await getDocumentTranslationMetadata(taskId)
  const submissionId = metadata.jobs[localeId.replace('-', '_')]

  const getTargetUrl = `${baseUrl}/rest/v0/targets?submissionIds=${submissionId}`

  const targetHeaders = {
    authorization: `Bearer ${token}`,
    'X-URL': getTargetUrl,
  }

  const targets = await fetch(globalLinkProxy, { headers: targetHeaders })
    .then(res => res.json())
    .then(targets =>
      targets.filter(target => target.targetLanguage === localeId)
    )

  const targetId = targets[0].targetId

  const downloadHeaders = {
    ...targetHeaders,
    'X-URL': `${baseUrl}/rest/v0/submissions/${submissionId}/download?deliverableTargetIds=${targetId}`,
  }

  const downloadId = (await fetch(globalLinkProxy, { headers: downloadHeaders })
    .then(res => res.json())
    .then(res => res.downloadId)) as string
  
  await pollForDownload(downloadId, submissionId, token)
  return handleFileDownload(downloadId, submissionId, taskId, localeId, token)
}

const pollForDownload = async (
  downloadId: string,
  submissionId: string,
  token: string
) => {
    const processingFinished = await fetch(globalLinkProxy, {
      headers: {
        'X-URL': `${baseUrl}/rest/v0/submissions/${submissionId}/download?downloadId=${downloadId}`,
        authorization: `Bearer ${token}`,
      },
    })
    .then(res => res.json())
    .then(res => res.processingFinished)

  if (!processingFinished) {
    console.info('Still awaiting Global Link download request to be processed...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    return pollForDownload(downloadId, submissionId, token)
  } else {
    console.info('Global Link download request processed. Starting download...')
    return
  }
}

const handleFileDownload = (
  downloadId: string,
  submissionId: string,
  documentId: string,
  localeId: string,
  token: string
) => {
  const url = `${baseUrl}/rest/v0/submissions/download/${downloadId}`
  const headers = {
    'X-URL': url,
    authorization: `Bearer ${token}`,
  }

  return (
    fetch(globalLinkProxy, { headers })
      .then(res => res.blob())
      .then(JSZip.loadAsync)
      //@ts-ignore
      .then(zip => zip.folder(`Sub_${submissionId}_${localeId}`))
      .then(zip => zip.folder(`${documentId}_${localeId}_Translated`))
      .then(folder => folder.file(`${documentId}.html`).async('string'))
      .then(str => JSON.parse(str).content)
  )
}
