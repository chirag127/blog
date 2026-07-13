/**
 * <MultiSearch /> — family-wide search dropdown for the BaseLayout
 * header. Lets a reader search across every site in the chirag127/oriz
 * family from any page.
 *
 * Implementation notes:
 *  - Loads a lightweight static index of family sites (no network on
 *    keystroke — the index is shipped in the bundle).
 *  - When the user picks a target site, the query is forwarded to that
 *    site's own /search/ page via a URL query string. Each family site
 *    handles its own search backend (Pagefind for small corpora,
 *    Algolia for oriz-blog per Batch-4 lock).
 */
import type { JSX } from 'react'
import { useEffect, useRef, useState } from 'react'

interface FamilySite {
  id: string
  label: string
  url: string
  searchPath: string
  hint: string
}

const SITES: FamilySite[] = [
  {
    id: 'home',
    label: 'oriz',
    url: 'https://oriz.in',
    searchPath: '/search/?q=',
    hint: 'home + family directory',
  },
  {
    id: 'blog',
    label: 'blog',
    url: 'https://blog.oriz.in',
    searchPath: '/search/?q=',
    hint: 'engineering writing',
  },
  {
    id: 'me',
    label: 'me',
    url: 'https://me.oriz.in',
    searchPath: '/search/?q=',
    hint: 'lifestream',
  },
  {
    id: 'books',
    label: 'books',
    url: 'https://books.oriz.in',
    searchPath: '/search/?q=',
    hint: 'reviews + reading',
  },
  {
    id: 'finance',
    label: 'finance',
    url: 'https://finance.oriz.in',
    searchPath: '/search/?q=',
    hint: 'finance writing',
  },
  {
    id: 'tools',
    label: 'tools',
    url: 'https://tools.oriz.in',
    searchPath: '/search/?q=',
    hint: 'small dev tools',
  },
  {
    id: 'ext',
    label: 'extensions',
    url: 'https://extensions.oriz.in',
    searchPath: '/search/?q=',
    hint: 'browser extensions',
  },
  {
    id: 'status',
    label: 'status',
    url: 'https://status.oriz.in',
    searchPath: '/?q=',
    hint: 'uptime board',
  },
]

export default function MultiSearch(): JSX.Element {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
        setTimeout(() => inputRef.current?.focus(), 30)
      } else if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  const submit = (site: FamilySite): void => {
    const target = `${site.url}${site.searchPath}${encodeURIComponent(query)}`
    window.location.href = target
  }

  return (
    <div className="oriz-multisearch">
      <button
        type="button"
        className="oriz-multisearch__trigger"
        aria-label="Search across the oriz family (Cmd+K)"
        onClick={() => {
          setOpen(true)
          setTimeout(() => inputRef.current?.focus(), 30)
        }}
      >
        <span aria-hidden="true">⌕</span>
        <span className="oriz-multisearch__kbd">⌘K</span>
      </button>
      {open && (
        <div className="oriz-multisearch__overlay" role="dialog" aria-modal="true">
          <div className="oriz-multisearch__panel">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the oriz family…"
              className="oriz-multisearch__input"
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false)
                if (e.key === 'Enter' && query.trim()) submit(SITES[1]) // default to blog
              }}
            />
            <ul className="oriz-multisearch__sites">
              {SITES.map((s) => (
                <li key={s.id}>
                  <button type="button" onClick={() => submit(s)} disabled={!query.trim()}>
                    <span className="oriz-multisearch__site-label">{s.label}.oriz.in</span>
                    <span className="oriz-multisearch__site-hint">{s.hint}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="oriz-multisearch__close"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
