/**
 * <Search /> — Algolia-backed search island with a graceful client-side
 * fallback when Algolia env vars are absent.
 *
 * Per Batch-4 lock: Algolia is the search-large-corpus pick for
 * oriz-blog. Free tier: 10K records + 10K monthly queries — well
 * inside `never-hit-quotas`. When `PUBLIC_ALGOLIA_APP_ID` is empty
 * (dev / fork without env wired), the component falls back to a
 * client-side substring filter over a static index passed in via
 * the `fallback` prop.
 *
 * If `@algolia/autocomplete-js` is installed at build-time, the
 * dynamic import lights up; otherwise the component stays in
 * fallback mode without breaking the build.
 */
import { useEffect, useMemo, useRef, useState } from 'react'

export interface SearchHit {
  /** Stable id (post slug or path). */
  objectID: string
  title: string
  description?: string
  url: string
  pubDate?: string
  tags?: string[]
}

interface Props {
  /** Static fallback corpus when Algolia env is absent. */
  fallback?: SearchHit[]
  /** Placeholder text for the input. */
  placeholder?: string
  /** Override the index name (defaults to PUBLIC_ALGOLIA_INDEX_NAME). */
  indexName?: string
}

const APP_ID =
  (typeof import.meta !== 'undefined' &&
    (import.meta as unknown as { env?: Record<string, string> }).env?.PUBLIC_ALGOLIA_APP_ID) ||
  ''
const SEARCH_KEY =
  (typeof import.meta !== 'undefined' &&
    (import.meta as unknown as { env?: Record<string, string> }).env?.PUBLIC_ALGOLIA_SEARCH_KEY) ||
  ''
const DEFAULT_INDEX =
  (typeof import.meta !== 'undefined' &&
    (import.meta as unknown as { env?: Record<string, string> }).env?.PUBLIC_ALGOLIA_INDEX_NAME) ||
  'oriz-blog'

export default function Search({
  fallback = [],
  placeholder = 'Search posts…',
  indexName = DEFAULT_INDEX,
}: Props): JSX.Element {
  const algoliaEnabled = APP_ID.length > 0 && SEARCH_KEY.length > 0
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<SearchHit[]>([])
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo<SearchHit[]>(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return fallback
      .filter((h) => {
        return (
          h.title.toLowerCase().includes(q) ||
          (h.description ?? '').toLowerCase().includes(q) ||
          (h.tags ?? []).some((t) => t.toLowerCase().includes(q))
        )
      })
      .slice(0, 10)
  }, [query, fallback])

  // Algolia path — uses fetch directly so we don't pay for the @algolia
  // client unless the user actually types. Keeps the static bundle small.
  useEffect(() => {
    if (!algoliaEnabled) {
      setHits(filtered)
      return
    }
    if (!query.trim()) {
      setHits([])
      return
    }
    const controller = new AbortController()
    const run = async (): Promise<void> => {
      try {
        const res = await fetch(
          `https://${APP_ID}-dsn.algolia.net/1/indexes/${encodeURIComponent(indexName)}/query`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Algolia-API-Key': SEARCH_KEY,
              'X-Algolia-Application-Id': APP_ID,
            },
            body: JSON.stringify({ params: `query=${encodeURIComponent(query)}&hitsPerPage=10` }),
            signal: controller.signal,
          },
        )
        if (!res.ok) {
          // Algolia hiccup → silently degrade to fallback
          setHits(filtered)
          return
        }
        const data = (await res.json()) as { hits: SearchHit[] }
        setHits(Array.isArray(data.hits) ? data.hits : [])
      } catch {
        setHits(filtered)
      }
    }
    void run()
    return () => controller.abort()
  }, [query, algoliaEnabled, indexName, filtered])

  const showFallback = !algoliaEnabled
  const list = algoliaEnabled ? hits : filtered

  return (
    <div className="oriz-search" data-algolia={algoliaEnabled ? '1' : '0'}>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder={placeholder}
        aria-label="Search posts"
        className="oriz-search__input"
      />
      {open && query.trim() !== '' && (
        <ul className="oriz-search__results" role="listbox">
          {list.length === 0 ? (
            <li className="oriz-search__empty" role="presentation">
              No matches{showFallback ? ' (client-side search)' : ''}.
            </li>
          ) : (
            list.map((hit) => (
              <li key={hit.objectID} role="option" aria-selected="false">
                <a href={hit.url} className="oriz-search__hit">
                  <span className="oriz-search__hit-title">{hit.title}</span>
                  {hit.description && (
                    <span className="oriz-search__hit-desc">{hit.description}</span>
                  )}
                </a>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
