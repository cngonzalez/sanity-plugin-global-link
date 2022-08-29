import { getDocumentTranslationMetadata } from '../helpers'
//@ts-ignore
import sanityClient from 'part:@sanity/base/client'
const client = sanityClient.withConfig({ apiVersion: '2021-03-25' })

const createOrUpdateMetadata = async (
  submissionId: string,
  documentId: string,
  localeIds: string[]
) => {
  const metadata = await getDocumentTranslationMetadata(documentId)
  const metadataId = `globalLink-metadata.${documentId}`
  const jobs = localeIds.reduce((jobObj, locale) => {
    //hyphens not allowed in Sanity field names
    jobObj[locale.replace('-', '_')] = submissionId
    return jobObj
  }, {})
  let result
  if (!metadata) {
    result = await client.create({
      _id: metadataId,
      _type: `globalLink.metadata`,
      jobs,
    })
  } else {
    const jobPatches = localeIds.reduce((jobObj, locale) => {
      jobObj[`jobs.${locale.replace('-', '_')}`] = submissionId
      return jobObj
    }, {})
    result = await client
      .patch(metadataId)
      .set(jobPatches)
      .commit()
  }
  return result
}

export default createOrUpdateMetadata
