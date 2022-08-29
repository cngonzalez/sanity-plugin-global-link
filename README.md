
# Studio Plugin for Sanity & Global Link

# Table of Contents
- [Plugin features](#plugin-features)
- [Assumptions](#assumptions)
- [Quickstart](#quickstart)
- [Studio experience](#studio-experience)
- [Overriding defaults](#overriding-defaults)

## Plugin features

This plugin comes with (and exposes to the developer) the following items:
- An `Adapter` that connects to the Global Link API with methods to create a new translation job, upload and assign a file to that translation job, check the progress of an ongoing translation, and retrieve a translated file.
- A `Serializer` that transforms your content into HTML (we found this was the most efficient way to maintain your document structure, no matter how deeply nested, while remaining readable to translators in Global Link). The `Serializer` takes in optional arguments: `stopTypes`, which prevents certain types from being sent to your translatiors and `customSerializers`, which are rules you can use to have full control over how individual fields on your document get serialized.
- A `Deserializer` that deserializes translated text back to Sanity's format.
- A `Patcher` which determines how your content gets patched back into its destination document or field.
- A `TranslationsTab`, a React element that allows a non-technical user to import, export, and monitor Global Link progress.

To make life easier, we also include `defaultFieldLevelConfig` and `defaultDocumentLevelConfig`, which bundles all of the above up to get you up and running quickly. 

## Assumptions
To use the default config mentioned above, we assume that you are following the conventions we outline in [our documentation on localization](https://www.sanity.io/docs/localization). 


### Field-level translations
If you are using field-level translation, we assume any fields you want translated exist in the multi-locale object form we recommend.
For example, on a document you don't want to be translated, you may have a "title" field that's a flat string: `title: 'My title is here.'` For a field you want to include many languages for, your title may look like
        ```
        { title: {
            en: 'My title is here.',
            es: 'Mi título está aquí.',
            etc...
          }
        }
        ```
*Important*: Some locale representation includes hyphens, like `fr-FR`. These aren't valid as Sanity field names, so ensure that on your fields you change the hyphens to underscores (like `fr_FR`).

### Document level translations
Since we often find users want to use the [Internationalization input plugin](https://www.sanity.io/plugins/sanity-plugin-intl-input) if they're using document-level translations, we assume that any documents you want in different languages will follow the pattern `i18n.{id-of-base-language-document}.{locale}`

### Final note
It's okay if your data doesn't follow these patterns and you don't want to change them! You will simply have to override how the plugin gets and patches back information from your documents. Please see [Overriding defaults](#overriding-defaults).

## Quickstart
1. Install this plugin with `npm install sanity-plugin-globallink`

2. Because of Global Link CORS restrictions, you will need to set up a proxy endpoint to funnel requests to Global Link. We've provided a tiny Next.js app you can set up [here](https://github.com/sanity-io/example-sanity-proxy). If that's not useful, the important thing to pay attention to is that this endpoint handles requests with an `X-URL` header that contains the Global Link URL configured by the plugin, and can parse a data file to an HTML string and send it back to the adapter.

3. Once your proxy is set up, ensure that endpoint is available to your Sanity studio by placing it in the appropriate `.env` file (if you're developing locally, that's `.env.development`). That file should look like this:
```
#any other environment variables...
SANITY_STUDIO_GLOBALLINK_PROXY=http://your-proxy-url.com
```

4. Ensure the plugin has access to your Global Link token secret. You'll want to create a document that includes your project name and a token secret with appropriate access. Please refer to the Global Link documentation on creating a token if you don't have one already.
    * In your studio, create a file called `populateGlobalLinkSecrets.js`.
    * Place the following in the file and fill out the correct values (those in all-caps).

```javascript
import sanityClient from 'part:@sanity/base/client'

const client = sanityClient.withConfig({ apiVersion: '2021-03-25' })

client.createOrReplace({
_id: 'globalLink.secrets',
_type: 'globalLinkSettings',
token: 'YOUR_TOKEN_HERE',
username: 'YOUR_USERNAME_HERE',
password: 'YOUR_PASSWORD_HERE',
})
```

   * On the command line, run the file with `sanity exec populateGlobalLinkSecrets.js --with-user-token`. 
   Verify that everything went well by using Vision in the studio to query `*[_id == 'globalLink.secrets']`. (NOTE: If you have multiple datasets, you'll have to do this across all of them, since it's a document!)
   * If everything looks good, go ahead and delete `populateGlobalLinkSecrets.js` so you don't commit it. 
   Because the document's `_id` is on a path (`globalLink`), it won't be exposed to the outside world, even in a public dataset. If you have concerns about this being exposed to authenticated users of your studio, you can control access to this path with [role-based access control](https://www.sanity.io/docs/access-control).

5.  Now it's time to get the Global Link tab on your desired document type, using whatever pattern you like. You'll use the [desk structure](https://www.sanity.io/docs/structure-builder-introduction) for this. The options for translation will be nested under this desired document type's views. Here's an example:

```javascript
import S from '@sanity/desk-tool/structure-builder'
//...your other desk structure imports...
import { TranslationsTab, defaultDocumentLevelConfig } from 'sanity-plugin-global-link'


export const getDefaultDocumentNode = (props) => {
  if (props.schemaType === 'myTranslatableDocumentType') {
    return S.document().views([
      S.view.form(),
      //...my other views -- for example, live preview, the i18n plugin, etc.,
      S.view.component(TranslationsTab).title('Global Link').options(
        defaultDocumentLevelConfig  
      )
    ])
  }
  return S.document();
};
```

And that should do it! 

## Studio experience
By adding the `TranslationsTab` to your desk structure, your users should now have an additional view. The boxes at the top of the tab can be used to send translations off to Global Link, and once those jobs are started, they should see progress bars monitoring the progress of the jobs. They can import a partial or complete job back.

## Overriding defaults

To personalize this configuration it's useful to know what arguments go into `TranslationsTab` as options (the `defaultConfigs` are just wrappers for these):
  * `exportForTranslation`: a function that takes your document id and returns an object with `name`: the field you want to use identify your doc in Global Link (by default this is `_id` and `content`: a serialized HTML string of all the fields in your document to be translated.
  * `importTranslation`: a function that takes in `id` (your document id) `localeId` (the locale of the imported language) and `document` the translated HTML from Global Link. It will deserialize your document back into an object that can be patched into your Sanity data, and then executes that patch.
  * `Adapter`: An interface with methods to send things over to Global Link. You likely don't want to override this!

There are a number of reasons to override these functions. More general cases are often around ensuring documents serialize and deserialize correctly. Since the serialization fucntions are used across all our translation plugins currently, you can find some frequently encountered scenarios at [their repository here](https://github.com/sanity-io/sanity-naive-html-serializer), along with code examples for new config. 

This plugin is in early stages. We plan on improving some of the user-facing Chrome, sorting out some quiet bugs, figuring out where things don't fail elegantly, etc. Please be a part of our development process!
