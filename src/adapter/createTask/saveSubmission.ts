import { globalLinkProxy, baseUrl } from '../helpers'

const saveSubmission = async (token: string, submissionId: string) => {
  const headers = {
    authorization: `Bearer ${token}`,
    'X-URL': `${baseUrl}/rest/v0/submissions/${submissionId}/save`,
    'content-type': 'application/json',
  }

  const body = JSON.stringify({ autoStart: true })

  return fetch(globalLinkProxy, {
    method: 'POST',
    headers,
    body,
  }).then(res => res.json())
}

export default saveSubmission
