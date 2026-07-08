/**
 * /search-index.json — JSON dump of every published post for Fuse.js or
 * other client-side search fallbacks. The primary search uses Pagefind;
 * this exists as a typed snapshot for tooling that wants the metadata.
 */
import { type CollectionEntry, getCollection } from 'astro:content'
import type { APIContext } from 'astro'

export async function GET(_context: APIContext) {
  const posts = await getCollection(
    'blog',
    (entry: CollectionEntry<'blog'>) => !entry.data.draft,
  )
  const sorted = posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  )

  const index = sorted.map((post) => ({
    id: post.id,
    title: post.data.title,
    description: post.data.description,
    tags: post.data.tags,
    category: post.data.category,
    categories: post.data.categories,
    series: post.data.series,
    author: post.data.author,
    url: `/blog/${post.id}/`,
    date: post.data.pubDate.toISOString(),
  }))

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
