import sanityClient from 'part:@sanity/base/client'

const client = sanityClient.withConfig({ apiVersion: '2022-08-29' })

client.delete({query: `*[_type == 'globalLink.metadata']`})
