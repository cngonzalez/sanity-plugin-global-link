import { globalLinkProxy, baseUrl } from '../helpers'

const createSubmission = async (
  documentId: string,
  project: string,
  localeIds: string[],
  token: string,
  workflowUid?: string
) => {
  const headers = {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
    'X-URL': `${baseUrl}/rest/v0/submissions/create`,
  }

  const body = JSON.stringify({
    projectId: project,
    //HARDCODED for now, default due date is a year from now
    dueDate: 1964477679000,
    sourceLanguage: 'en-US',
    batchInfos: [
      {
        workflowId: workflowUid,
        targetFormat: 'TXLF',
        //what is this used for?
        name: documentId,
        targetLanguageInfos: localeIds.map(id => ({ targetLanguage: id })),
      },
    ],
    claimScope: 'LANGUAGE',
    name: documentId,
  })

  return (
    fetch(globalLinkProxy, {
      method: 'POST',
      headers,
      body,
    })
      .then(res => res.json())
      //TODO: error handling
      .then(res => res.submissionId)
  )
}

export default createSubmission
