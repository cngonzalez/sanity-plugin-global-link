import {
  TranslationsTab,
  baseFieldLevelConfig,
  baseDocumentLevelConfig,
  BaseDocumentDeserializer,
  BaseDocumentMerger,
  BaseDocumentSerializer,
  defaultStopTypes,
  customSerializers,
} from 'sanity-translations-tab'
import GlobalLinkAdapter from './adapter/index'

const workflowOptions = [
  {
    workflowUid: 154,
    workflowName: 'Mt-Tauyou-PD-REST',
  },
  {
    workflowUid: 32,
    workflowName: 'Pseudo',
  },
]

const defaultDocumentLevelConfig = {
  ...baseDocumentLevelConfig,
  adapter: GlobalLinkAdapter,
  secretsNamespace: 'globalLink',
  workflowOptions,
}

const defaultFieldLevelConfig = {
  ...baseFieldLevelConfig,
  adapter: GlobalLinkAdapter,
  secretsNamespace: 'globalLink',
  workflowOptions,
}

export {
  TranslationsTab,
  BaseDocumentDeserializer,
  BaseDocumentSerializer,
  BaseDocumentMerger,
  defaultStopTypes,
  customSerializers,
  GlobalLinkAdapter,
  defaultDocumentLevelConfig,
  defaultFieldLevelConfig,
}
