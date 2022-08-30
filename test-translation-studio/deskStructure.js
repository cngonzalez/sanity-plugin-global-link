import { defaultFieldLevelConfig, TranslationsTab } from '../src/index'
import S from '@sanity/desk-tool/structure-builder'

export const getDefaultDocumentNode = (props) => {
    if (['product'].includes(props.schemaType)) {
      return S.document().views([
        S.view.form(),
        //...my other views -- for example, live preview, the i18n plugin, etc.,
        S.view.component(TranslationsTab).title('Global Link').options(
          defaultFieldLevelConfig  
        )
      ])
    }
    return S.document();
};

export default () =>
  S.list()
    .title('Content')
    .items(
      S.documentTypeListItems()
    )

