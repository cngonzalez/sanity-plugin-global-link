# Global Link integration test studio

This is an (almost) vanilla version of the Sanity Ecommerce Content Studio, for testing purposes of the POC Global Link integration. It is intended to
provide developers an environment for quick iteration of the code and tooling.

## Quickstart
Please follow the following steps to get started.
1. Start a new Sanity project in this folder by running `sanity init`.
  a. You will be prompted to reconfigure a Sanity studio -- select `yes`.
  b. Select `Create new project`.
  c. Use the default dataset configuration (`production`).
2. Import the test data by running `sanity dataset import production.tar.gz`
3. Fill out the relevant fields in `createGlobalLinkSettings.js` and run `sanity exec createGlobalLinkSettings.js --with-user-token` to create the Global Link secrets document.
4. Get a proxy enabled for the `X-URL` pattern (subject to change -- we'd like to establish a pattern that works with nginx, for example). If you use the [example proxy repo here](https://github.com/cngonzalez/example-sanity-proxy), you can run `npm run dev` to get a proxy running on port 3000.
5. Add the proxy endpoint to `.env.development` as the env var `SANITY_STUDIO_GLOBALLINK_PROXY`. For example, if you're using the example proxy repo, you would add `SANITY_STUDIO_GLOBALLINK_PROXY=http://localhost:3000/api/proxy`. 
6. Run `sanity start` to start the studio. The tab is enabled on the `product` document type. Upon loading the tab you should see your locales listed. 
7. This studio is pulling the plugin logic from the enclosing folder. To make changes, you can simply edit the plugin code in the enclosing folder (for example, adding a `console.log` statement in `../adapter/getLocales.ts`) and the studio should rebuild upon ny changes. You can test a build of the plugin by running `npm pack` in the enclosing folder and then running `npm install ../sanity-plugin-global-link-{your-version}.tgz` in the studio folder.

## Notes
By design, this repo only holds the logic specific to round-tripping content from the Global Link REST API. The UI and logic for the components seen on the frontend are contained in the [Translations Tab](https://github.com/sanity-io/sanity-translations-tab), along with configuration items for importing and exporting content. In turn, that import and export logic depends on serializing content into HTML, deserializing it back, and merging with content that has not been sent over for translation. This logic is contained in the [Naive HTML Serializer](https://github.com/sanity-io/sanity-naive-html-serializer).

## Function explanations
The following functions are used in the plugin. They are all contained in the `../adapter` folder.

1. `getLocales` - This function is used to retrieve the locales that are available for the project. It is called when the tab is loaded, and the locales are then used to populate the checkboxes in the UI.
2. `getTranslationTask` - Like `getLocales`, this function is passively called on the tab load. It is used to retrieve the translation tasks for the document, if one exists. If one does not exist, it will return an empty array. We are keeping track of translation tasks via a metadata document, following the pattern you might see in other Sanity implementations -- for example, our workflow studio. These metadata documents are 1-to-1 with their parent documents, and they look like:
    ```json
    {
      "_id": "globalLink-metadata.${documentId}",
      "_type": "globalLink.metadata",
      "jobs": {
        ${localeId, e.g. 'de_DE'}: ${submission ID for the job that started a task to translate to this locale}
      }
    }
    ```
    The submission IDs determined from the "jobs" object are used to retrieve the translation task progress via the REST API.
3. `createTask` - This function is called when an end user selects locales and clicks "Create Job". A number of actions happen: a "submission" is created in Global Link, serialized content is uploaded to Global Link, the submission is saved, and finally a metadata document is created or edited with the updated submission ID. The submission ID is used to retrieve the translation task progress via the REST API, as explained above.
4.  `getTranslation` - This function is called when an end user clicks the "Import" button in the UI. The function retrieves the translation from Global Link using the submission ID found in the metadata, downloads a ZIP, deserializes it, and merges it with the existing content. The merged content is then saved to Sanity. (The deserialization and merge logic are part of the configuration of `TranslationsTab`.)