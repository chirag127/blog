/**
 * Blog helpers — read the `blog` content collection and expose
 * sorting, filtering, related-post, archive, and series helpers.
 *
 * All helpers return non-draft posts only and are sorted newest-first
 * by `pubDate` unless otherwise documented.
 */

import { type CollectionEntry, getCollection, render } from 'astro:content'
import readingTime from 'reading-time'

export type BlogPost = CollectionEntry<'blog'>

/** Sort posts by pubDate, newest first. */
function byNewest(a: BlogPost, b: BlogPost): number {
  return b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
}

/** All published (non-draft) posts, newest first. */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }) => data.draft === false)
  return posts.sort(byNewest)
}

/** Featured posts (data.featured === true). */
export async function getFeaturedPosts(limit = 3): Promise<BlogPost[]> {
  const all = await getPublishedPosts()
  return all.filter((p) => p.data.featured === true).slice(0, limit)
}

/** Posts that have `tag` in their `tags` array (case-insensitive). */
export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const target = tag.toLowerCase()
  const posts = await getPublishedPosts()
  return posts.filter((p) => p.data.tags.some((t) => t.toLowerCase() === target))
}

/**
 * The set of categories a post belongs to. The schema accepts both a
 * singular `category` and plural `categories`; this helper unifies them.
 */
export function getPostCategories(post: BlogPost): string[] {
  if (post.data.categories?.length) return post.data.categories
  return [post.data.category]
}

/** Posts in a given category (case-insensitive, considers both fields). */
export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const target = category.toLowerCase()
  const posts = await getPublishedPosts()
  return posts.filter((p) => getPostCategories(p).some((c) => c.toLowerCase() === target))
}

/** Posts written by a specific author (case-insensitive). */
export async function getPostsByAuthor(author: string): Promise<BlogPost[]> {
  const target = author.toLowerCase()
  const posts = await getPublishedPosts()
  return posts.filter((p) => p.data.author.toLowerCase() === target)
}

/** Posts that share a `series` value. Sorted by `part`, then pubDate. */
export async function getPostsInSeries(series: string): Promise<BlogPost[]> {
  const posts = await getPublishedPosts()
  return posts
    .filter((p) => p.data.series === series)
    .sort((a, b) => {
      const ka = partKey(a)
      const kb = partKey(b)
      if (ka !== kb) return ka - kb
      return a.data.pubDate.valueOf() - b.data.pubDate.valueOf()
    })
}

function partKey(p: BlogPost): number {
  const v = p.data.part
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = Number.parseInt(v, 10)
    if (!Number.isNaN(n)) return n
  }
  return Number.POSITIVE_INFINITY
}

/**
 * Related posts. Ranking:
 *   1. Posts in the same series (highest priority)
 *   2. Highest tag-overlap with `current`
 *   3. Same category as `current`
 *   4. Most recent posts (final fallback)
 */
export async function getRelatedPosts(current: BlogPost, limit = 3): Promise<BlogPost[]> {
  const all = await getPublishedPosts()
  const others = all.filter((p) => p.id !== current.id)

  const currentTags = new Set(current.data.tags.map((t) => t.toLowerCase()))
  const currentCategories = new Set(getPostCategories(current).map((c) => c.toLowerCase()))
  const currentSeries = current.data.series

  type Scored = {
    post: BlogPost
    sameSeries: boolean
    tagOverlap: number
    sameCategory: boolean
  }
  const scored: Scored[] = others.map((post) => ({
    post,
    sameSeries: !!currentSeries && post.data.series === currentSeries,
    tagOverlap: post.data.tags.filter((t) => currentTags.has(t.toLowerCase())).length,
    sameCategory: getPostCategories(post).some((c) => currentCategories.has(c.toLowerCase())),
  }))

  scored.sort((a, b) => {
    if (a.sameSeries !== b.sameSeries) return a.sameSeries ? -1 : 1
    if (b.tagOverlap !== a.tagOverlap) return b.tagOverlap - a.tagOverlap
    if (a.sameCategory !== b.sameCategory) return a.sameCategory ? -1 : 1
    return byNewest(a.post, b.post)
  })

  const picked: BlogPost[] = []
  const seen = new Set<string>()
  for (const s of scored) {
    if (!s.sameSeries && s.tagOverlap === 0 && !s.sameCategory) break
    if (seen.has(s.post.id)) continue
    picked.push(s.post)
    seen.add(s.post.id)
    if (picked.length >= limit) return picked
  }

  for (const post of others) {
    if (picked.length >= limit) break
    if (seen.has(post.id)) continue
    picked.push(post)
    seen.add(post.id)
  }

  return picked.slice(0, limit)
}

/** Unique tags across published posts, alphabetically sorted, with counts. */
export async function getTagsWithCounts(): Promise<{ tag: string; count: number }[]> {
  const posts = await getPublishedPosts()
  const m = new Map<string, number>()
  for (const p of posts) for (const t of p.data.tags) m.set(t, (m.get(t) ?? 0) + 1)
  return [...m.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

export async function getAllTags(): Promise<string[]> {
  return (await getTagsWithCounts()).map((t) => t.tag)
}

/** Unique categories across published posts (considers both singular + plural). */
export async function getCategoriesWithCounts(): Promise<{ category: string; count: number }[]> {
  const posts = await getPublishedPosts()
  const m = new Map<string, number>()
  for (const p of posts) for (const c of getPostCategories(p)) m.set(c, (m.get(c) ?? 0) + 1)
  return [...m.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category))
}

export async function getAllCategories(): Promise<string[]> {
  return (await getCategoriesWithCounts()).map((c) => c.category)
}

/** Unique series across published posts. */
export async function getSeriesWithCounts(): Promise<{ series: string; count: number }[]> {
  const posts = await getPublishedPosts()
  const m = new Map<string, number>()
  for (const p of posts) {
    if (p.data.series) m.set(p.data.series, (m.get(p.data.series) ?? 0) + 1)
  }
  return [...m.entries()]
    .map(([series, count]) => ({ series, count }))
    .sort((a, b) => b.count - a.count || a.series.localeCompare(b.series))
}

/** Unique authors across published posts. */
export async function getAuthorsWithCounts(): Promise<{ author: string; count: number }[]> {
  const posts = await getPublishedPosts()
  const m = new Map<string, number>()
  for (const p of posts) m.set(p.data.author, (m.get(p.data.author) ?? 0) + 1)
  return [...m.entries()]
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count || a.author.localeCompare(b.author))
}

/** Group posts by year (newest first). */
export async function getPostsByYear(): Promise<{ year: number; posts: BlogPost[] }[]> {
  const posts = await getPublishedPosts()
  const m = new Map<number, BlogPost[]>()
  for (const p of posts) {
    const y = p.data.pubDate.getFullYear()
    const arr = m.get(y) ?? []
    arr.push(p)
    m.set(y, arr)
  }
  return [...m.entries()].map(([year, posts]) => ({ year, posts })).sort((a, b) => b.year - a.year)
}

/** Format a date as "DD MMM YYYY" (e.g. "19 Jun 2026"). */
export function formatPostDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Slugify a tag/category/author/series name for URLs. */
export function slugifyTag(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Content verticals — collapse the ~40 raw category strings into the five
 * editorial desks the notebook actually covers. Drives the vertical marker
 * colour (--v-*) on cards, rows, and category kickers so Dev / Finance /
 * Culture / Health read differently at a glance without leaving the pure
 * editorial system.
 */
export type Vertical = 'dev' | 'finance' | 'culture' | 'health' | 'personal'

const VERTICAL_LABEL: Record<Vertical, string> = {
  dev: 'Dev',
  finance: 'Finance',
  culture: 'Culture',
  health: 'Health',
  personal: 'Personal',
}

/** Map a raw category string → one of the five verticals. */
export function verticalFor(category: string): Vertical {
  const c = category.toLowerCase()
  if (/(health|medic|pharma|skincare|beauty|ingredient|safety|routine)/.test(c)) return 'health'
  if (/(finance|invest|wealth|tax|money|credit|automation)/.test(c)) return 'finance'
  if (
    /(engineer|tech|software|developer|tool|ai|ml|code|projects|learning|education|career)/.test(c)
  )
    return 'dev'
  if (/(culture|entertainment|travel|relationship|lifestyle|self-improvement|life)/.test(c))
    return 'culture'
  return 'personal'
}

/** Human label for a vertical. */
export function verticalLabel(v: Vertical): string {
  return VERTICAL_LABEL[v]
}

/** Vertical + label for a post (uses its primary category). */
export function postVertical(post: BlogPost): Vertical {
  return verticalFor(getPostCategories(post)[0] ?? post.data.category)
}

/**
 * Compute reading time for a post if not provided in frontmatter.
 * Renders the post body, strips MDX/code, and runs reading-time.
 */
export async function getReadingTime(post: BlogPost): Promise<string> {
  if (post.data.readingTime) return String(post.data.readingTime)
  try {
    const { Content: _Content } = await render(post)
    // We don't have access to plain text easily; estimate from raw body if available.
    const body = (post as unknown as { body?: string }).body ?? ''
    const stat = readingTime(body)
    return stat.text
  } catch {
    return '5 min read'
  }
}

/** Synchronous variant: read directly from the post body (cheap). */
export function readingTimeFor(post: BlogPost): string {
  const body = (post as unknown as { body?: string }).body ?? ''
  if (!body) return '5 min read'
  return readingTime(body).text
}
