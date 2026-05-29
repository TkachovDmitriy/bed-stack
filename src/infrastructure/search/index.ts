import { MeiliSearch } from 'meilisearch'
import { env } from '../config/env'

export const search = new MeiliSearch({
  host:   env.MEILISEARCH_URL,
  apiKey: env.MEILISEARCH_API_KEY,
})
