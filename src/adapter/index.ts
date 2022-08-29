import { Adapter } from 'sanity-translations-tab'
import { getTranslationTask } from './getTranslationTask'
import createTask from './createTask'
import { getTranslation } from './getTranslation'
import { getLocales } from './getLocales'

const GlobalLinkAdapter: Adapter = {
  getLocales,
  getTranslationTask,
  createTask,
  getTranslation,
}

export default GlobalLinkAdapter
