import sanityClient from 'part:@sanity/base/client'

const client = sanityClient.withConfig({ apiVersion: '2021-03-25' })

client.createOrReplace({
  _id: "globalLink.secrets",
  _type: "globalLinkSettings",
  password: "",
  project: "",
  token: "",
  username: "",
})
