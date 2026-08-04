/**
 * Bookmarks library — hybrid Firestore + localStorage store.
 *
 * Anonymous (not signed in) → bookmarks live in localStorage under `oriz:blog:bookmarks`.
 * Signed-in user → bookmarks live at `/blog/users/{uid}/bookmarks/{postSlug}`.
 *   On sign-in, any pending localStorage bookmarks are merged into Firestore
 *   (last-write-wins by `savedAt`).
 *
 * The post-detail Bookmark button + /bookmarks page both call into this
 * module — never touch localStorage / Firestore directly elsewhere.
 *
 * Auth is Clerk — pass `{ id: clerk.user.id }` as the `user` param, or
 * use the `useBookmarks` hook (if available) which wires Clerk automatically.
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'

/** Minimal user shape — compatible with Clerk's user object. */
export interface AuthUser {
  id: string
}

export interface Bookmark {
  /** post id, e.g. "ai-rag-pipelines-real-world" or "100-best-teen-dramas/part-1-foundation-90s" */
  slug: string
  url: string
  title: string
  description?: string
  category?: string
  pubDate?: string
  savedAt: string
}

const LS_KEY = 'oriz:blog:bookmarks'

function readLocal(): Bookmark[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') as Bookmark[]
  } catch {
    return []
  }
}

function writeLocal(items: Bookmark[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items))
  } catch {
    // ignore quota / private-mode failures
  }
}

function safeId(slug: string): string {
  // Firestore doc IDs cannot contain '/'.
  return slug.replace(/\//g, '__')
}

function userBookmarksCol(uid: string) {
  return collection(db, 'blog', 'users', uid, 'bookmarks')
}

/** True iff `slug` is bookmarked for the current user (or anon). */
export async function isBookmarked(slug: string, user: AuthUser | null): Promise<boolean> {
  if (user) {
    const ref = doc(db, 'blog', 'users', user.id, 'bookmarks', safeId(slug))
    const snap = await getDoc(ref)
    return snap.exists()
  }
  return readLocal().some((b) => b.slug === slug)
}

/** Add a bookmark. Optimistic — caller can re-render immediately. */
export async function addBookmark(b: Bookmark, user: AuthUser | null): Promise<void> {
  if (user) {
    const ref = doc(db, 'blog', 'users', user.id, 'bookmarks', safeId(b.slug))
    await setDoc(ref, b, { merge: true })
    return
  }
  const items = readLocal().filter((x) => x.slug !== b.slug)
  items.push(b)
  writeLocal(items)
}

/** Remove a bookmark. */
export async function removeBookmark(slug: string, user: AuthUser | null): Promise<void> {
  if (user) {
    const ref = doc(db, 'blog', 'users', user.id, 'bookmarks', safeId(slug))
    await deleteDoc(ref)
    return
  }
  writeLocal(readLocal().filter((b) => b.slug !== slug))
}

/** Read all bookmarks (one-shot). */
export async function listBookmarks(user: AuthUser | null): Promise<Bookmark[]> {
  if (user) {
    const q = query(userBookmarksCol(user.id), orderBy('savedAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => d.data() as Bookmark)
  }
  return readLocal().sort((a, b) => b.savedAt.localeCompare(a.savedAt))
}

/**
 * Subscribe to bookmark updates. Returns an unsubscribe.
 * For anon users this is a one-shot read (bookmarks are tab-local).
 */
export function watchBookmarks(user: AuthUser | null, cb: (items: Bookmark[]) => void): Unsubscribe {
  if (user) {
    const q = query(userBookmarksCol(user.id), orderBy('savedAt', 'desc'))
    return onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.data() as Bookmark)))
  }
  cb(readLocal().sort((a, b) => b.savedAt.localeCompare(a.savedAt)))
  // localStorage doesn't fire across tabs reliably; minimal fake unsubscribe.
  return () => {}
}

/**
 * Merge any anon bookmarks into Firestore on sign-in.
 * Last-write-wins by `savedAt`. Empties localStorage on success.
 */
export async function mergeOnSignIn(user: AuthUser): Promise<number> {
  const local = readLocal()
  if (local.length === 0) return 0
  const writes = local.map(async (b) => {
    const ref = doc(db, 'blog', 'users', user.id, 'bookmarks', safeId(b.slug))
    const existing = await getDoc(ref)
    if (existing.exists()) {
      const cur = existing.data() as Bookmark
      if (cur.savedAt >= b.savedAt) return
    }
    await setDoc(ref, b, { merge: true })
  })
  await Promise.all(writes)
  writeLocal([])
  return local.length
}

// ---- Recently viewed (always localStorage; never synced) ---------------

const RV_KEY = 'oriz:blog:recent'
const RV_MAX = 10

export interface RecentEntry {
  slug: string
  url: string
  title: string
  visitedAt: string
}

export function pushRecent(entry: Omit<RecentEntry, 'visitedAt'>): void {
  if (typeof window === 'undefined') return
  try {
    const cur: RecentEntry[] = JSON.parse(localStorage.getItem(RV_KEY) ?? '[]')
    const filtered = cur.filter((r) => r.slug !== entry.slug)
    filtered.unshift({ ...entry, visitedAt: new Date().toISOString() })
    localStorage.setItem(RV_KEY, JSON.stringify(filtered.slice(0, RV_MAX)))
  } catch {
    // ignore
  }
}

export function listRecent(): RecentEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(RV_KEY) ?? '[]') as RecentEntry[]
  } catch {
    return []
  }
}
