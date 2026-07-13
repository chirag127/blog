/**
 * BookmarksList — renders the user's bookmarks (Firestore for signed-in,
 * localStorage for anon). Subscribes to live updates.
 */

import type { User } from 'firebase/auth'
import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  type Bookmark as BookmarkData,
  listBookmarks,
  mergeOnSignIn,
  removeBookmark,
  watchAuth,
  watchBookmarks,
} from '~/lib/bookmarks'

export default function BookmarksList() {
  const [user, setUser] = useState<User | null>(null)
  const [items, setItems] = useState<BookmarkData[] | null>(null)

  useEffect(() => watchAuth(setUser), [])

  useEffect(() => {
    let cancelled = false
    if (user) {
      // On sign-in, merge any pending anon bookmarks.
      mergeOnSignIn(user).catch(() => {})
    }
    listBookmarks(user)
      .then((b) => !cancelled && setItems(b))
      .catch(() => !cancelled && setItems([]))
    const unsub = watchBookmarks(user, (b) => !cancelled && setItems(b))
    return () => {
      cancelled = true
      unsub()
    }
  }, [user])

  if (items === null) {
    return <p className="muted">Loading…</p>
  }

  if (items.length === 0) {
    return (
      <div className="empty">
        <p className="empty-h">No bookmarks yet.</p>
        <p className="empty-d">
          Tap the <strong>Save</strong> button on any post and it'll show up here.
        </p>
        <a href="/blog/" className="btn">
          Browse posts →
        </a>
        <style>{`
          .empty {
            padding: 3rem 1.5rem; text-align: center;
            background: var(--color-bg-soft);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-card);
          }
          .empty-h { font-weight: 600; margin: 0 0 0.25rem; font-size: 1.0625rem; }
          .empty-d { color: var(--color-fg-muted); margin: 0 0 1.25rem; font-size: 0.9375rem; max-width: 40ch; margin-inline: auto; }
          .btn {
            display: inline-flex; align-items: center; gap: 0.5rem;
            height: 40px; padding-inline: 1.125rem;
            background: var(--color-bg);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-button);
            color: var(--color-fg);
            font-weight: 500;
            text-decoration: none;
          }
          .btn:hover { border-color: color-mix(in oklab, var(--color-accent) 50%, var(--color-border)); }
        `}</style>
      </div>
    )
  }

  const remove = async (slug: string) => {
    await removeBookmark(slug, user)
  }

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <>
      <p className="status">
        {user ? (
          <>
            Synced as <strong>{user.email ?? 'signed-in user'}</strong>. {items.length} saved.
          </>
        ) : (
          <>
            Anonymous bookmarks ({items.length}) — they'll merge with your account next sign-in.{' '}
            <a href="/account/">Sign in to sync</a>.
          </>
        )}
      </p>

      <ul className="grid">
        {items.map((b) => (
          <li key={b.slug} className="card">
            <a href={b.url} className="card-link">
              {b.category && <span className="card-cat">{b.category}</span>}
              <h3 className="card-title">{b.title}</h3>
              {b.description && <p className="card-desc">{b.description}</p>}
              <span className="card-meta">
                Saved <time dateTime={b.savedAt}>{fmtDate(b.savedAt)}</time>
              </span>
            </a>
            <button
              type="button"
              className="card-remove"
              onClick={() => remove(b.slug)}
              aria-label={`Remove bookmark: ${b.title}`}
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>

      <style>{`
        .status { color: var(--color-fg-muted); font-size: 0.875rem; margin: 0 0 1.25rem; }
        .status a { color: var(--color-accent); }
        .grid {
          list-style: none; padding: 0; margin: 0;
          display: grid; gap: 0.875rem;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }
        .card {
          position: relative;
          background: var(--color-bg-soft);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-card);
        }
        .card:hover { border-color: color-mix(in oklab, var(--color-accent) 50%, var(--color-border)); }
        .card-link {
          display: grid; gap: 0.5rem;
          padding: 1.125rem;
          color: var(--color-fg);
          text-decoration: none;
        }
        .card-cat {
          align-self: start;
          padding: 0.125rem 0.5rem;
          background: var(--color-bg-muted);
          border-radius: 0.25rem;
          color: var(--color-fg-muted);
          font-size: 0.6875rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .card-title { margin: 0; font-size: 1rem; font-weight: 600; line-height: 1.35; }
        .card-desc {
          margin: 0; color: var(--color-fg-muted); font-size: 0.875rem;
          overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
        }
        .card-meta { color: var(--color-fg-soft); font-size: 0.75rem; }
        .card-remove {
          position: absolute; top: 0.75rem; right: 0.75rem;
          display: inline-flex; align-items: center; justify-content: center;
          width: 28px; height: 28px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 0.375rem;
          color: var(--color-fg-soft);
          cursor: pointer;
          transition: color 120ms, background 120ms, border-color 120ms;
        }
        .card-remove:hover {
          color: var(--color-fg);
          background: var(--color-bg);
          border-color: var(--color-border);
        }
        .muted { color: var(--color-fg-muted); }
      `}</style>
    </>
  )
}
