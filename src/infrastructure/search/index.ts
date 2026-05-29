import { MeiliSearch } from 'meilisearch'
import { env } from '../config/env'

if (!env.MEILISEARCH_URL) {
  throw new Error('MEILISEARCH_URL is required to use search')
}

export const search = new MeiliSearch({
  host:   env.MEILISEARCH_URL ?? '',
  apiKey: env.MEILISEARCH_API_KEY,
})
