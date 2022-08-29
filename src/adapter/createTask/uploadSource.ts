import { globalLinkProxy, baseUrl } from '../helpers'

const uploadSource = async (
  documentId: string,
  document: Record<string, any>,
  token: string,
  submissionId: string
) => {
  const url = `${baseUrl}/rest/v0/submissions/${submissionId}/upload/source`

  const headers = {
    authorization: `Bearer ${token}`,
    'X-URL': `${url}`,
  }

  const body = new FormData()
  body.append('batchName', documentId)
  body.append('fileFormatName', 'Sanity-HTML')
  body.append('extractArchive', 'false')

  const htmlBuffer = Buffer.from(JSON.stringify(document), 'utf-8')
  body.append('file', new Blob([htmlBuffer]), `${documentId}.html`)

  return fetch(globalLinkProxy, {
    method: 'POST',
    headers,
    body,
  }).then(res => res.json())
}

export default uploadSource
