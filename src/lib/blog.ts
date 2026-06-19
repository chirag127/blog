/**
 * Blog helpers — read the `blog` content collection and expose
 * sorting, filtering, and related-post helpers used by the /blog routes.
 *
 * All helpers return non-draft posts only and are sorted newest-first
 * by `pubDate` unless otherwise documented.
 */

import { type CollectionEntry, getCollection } from 'astro:content'

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

/** Posts that have `tag` in their `tags` array (case-insensitive). */
export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const target = tag.toLowerCase()
  const posts = await getPublishedPosts()
  return posts.filter((p) =>
    p.data.tags.some((t) => t.toLowerCase() === target),
  )
}

/** Posts in a given category (case-insensitive). */
export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const target = category.toLowerCase()
  const posts = await getPublishedPosts()
  return posts.filter((p) => p.data.category.toLowerCase() === target)
}

/**
 * Related posts. Ranking:
 *   1. Highest tag-overlap with `current` (excluding `current` itself).
 *   2. Same category as `current` (used as tiebreaker / fallback).
 *   3. Most recent posts (final fallback if still short).
 *
 * Returns up to `limit` posts (default 3).
 */
export async function getRelatedPosts(
  current: BlogPost,
  limit = 3,
): Promise<BlogPost[]> {
  const all = await getPublishedPosts()
  const others = all.filter((p) => p.id !== current.id)

  const currentTags = new Set(current.data.tags.map((t) => t.toLowerCase()))
  const currentCategory = current.data.category.toLowerCase()

  type Scored = { post: BlogPost; tagOverlap: number; sameCategory: boolean }
  const scored: Scored[] = others.map((post) => {
    const overlap = post.data.tags.filter((t) =>
      currentTags.has(t.toLowerCase()),
    ).length
    return {
      post,
      tagOverlap: overlap,
      sameCategory: post.data.category.toLowerCase() === currentCategory,
    }
  })

  scored.sort((a, b) => {
    if (b.tagOverlap !== a.tagOverlap) return b.tagOverlap - a.tagOverlap
    if (a.sameCategory !== b.sameCategory) return a.sameCategory ? -1 : 1
    return byNewest(a.post, b.post)
  })

  const picked: BlogPost[] = []
  const seen = new Set<string>()
  for (const s of scored) {
    if (s.tagOverlap === 0 && !s.sameCategory) break
    if (seen.has(s.post.id)) continue
    picked.push(s.post)
    seen.add(s.post.id)
    if (picked.length >= limit) return picked
  }

  // Fallback to most recent posts to reach `limit`.
  for (const post of others) {
    if (picked.length >= limit) break
    if (seen.has(post.id)) continue
    picked.push(post)
    seen.add(post.id)
  }

  return picked.slice(0, limit)
}

/** Unique tags across published posts, alphabetically sorted. */
export async function getAllTags(): Promise<string[]> {
  const posts = await getPublishedPosts()
  const set = new Set<string>()
  for (const p of posts) for (const t of p.data.tags) set.add(t)
  return [...set].sort((a, b) => a.localeCompare(b))
}

/** Unique categories across published posts, alphabetically sorted. */
export async function getAllCategories(): Promise<string[]> {
  const posts = await getPublishedPosts()
  const set = new Set<string>()
  for (const p of posts) set.add(p.data.category)
  return [...set].sort((a, b) => a.localeCompare(b))
}

/** Format a date as "DD MMM YYYY" (e.g. "19 Jun 2026"). */
export function formatPostDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** Slugify a tag/category for URLs. Mirrors Astro's default kebab-casing. */
export function slugifyTag(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
