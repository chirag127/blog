/**
 * BookmarkButton — toggles a Firestore bookmark (signed-in users) or a
 * localStorage bookmark (anon). Auto-rerenders on auth state changes and
 * on Firestore updates.
 *
 * Embedded inline on each post page; wired with `client:idle`.
 */
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  addBookmark,
  isBookmarked,
  removeBookmark,
  watchAuth,
  watchBookmarks,
  type Bookmark as BookmarkData,
} from '~/lib/bookmarks'
import type { User } from 'firebase/auth'

interface Props {
  slug: string
  url: string
  title: string
  description?: string
  category?: string
  pubDate?: string
}

export default function BookmarkButton(props: Props) {
  const [user, setUser] = useState<User | null>(null)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  // Track auth state
  useEffect(() => watchAuth(setUser), [])

  // Refresh bookmark state when user / slug changes, and subscribe to live updates.
  useEffect(() => {
    let cancelled = false
    isBookmarked(props.slug, user)
      .then((b) => !cancelled && setSaved(b))
      .catch(() => {})
    const unsub = watchBookmarks(user, (items) => {
      if (cancelled) return
      setSaved(items.some((b) => b.slug === props.slug))
    })
    return () => {
      cancelled = true
      unsub()
    }
  }, [user, props.slug])

  const toggle = async () => {
    if (busy) return
    setBusy(true)
    try {
      if (saved) {
        await removeBookmark(props.slug, user)
        setSaved(false)
      } else {
        const data: BookmarkData = {
          slug: props.slug,
          url: props.url,
          title: props.title,
          description: props.description,
          category: props.category,
          pubDate: props.pubDate,
          savedAt: new Date().toISOString(),
        }
        await addBookmark(data, user)
        setSaved(true)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      className="bookmark-btn"
      data-saved={saved ? '1' : '0'}
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? 'Remove bookmark' : 'Bookmark this post'}
    >
      {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
      <span>{saved ? 'Saved' : 'Save'}</span>

      <style>{`
        .bookmark-btn {
          display: inline-flex; align-items: center; gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          background: var(--color-bg-soft);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-button);
          color: var(--color-fg-muted);
          font-family: inherit;
          font-size: 0.8125rem;
          cursor: pointer;
          transition: border-color 120ms, color 120ms;
        }
        .bookmark-btn:hover { color: var(--color-fg); border-color: color-mix(in oklab, var(--color-accent) 50%, var(--color-border)); }
        .bookmark-btn[data-saved="1"] {
          color: var(--color-accent-fg);
          background: var(--color-accent);
          border-color: var(--color-accent);
        }
        .bookmark-btn:disabled { opacity: 0.6; cursor: progress; }
      `}</style>
    </button>
  )
}
