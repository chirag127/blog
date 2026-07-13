/**
 * /feed.json — JSON Feed 1.1 companion to /rss.xml + /atom.xml.
 *
 * Per Batch-12 lock, every family site ships THREE feed formats.
 * JSON Feed spec: https://www.jsonfeed.org/version/1.1/
 *
 * JSON-Feed is the modern alternative many readers (NetNewsWire,
 * Feedbin, Reeder) prefer because it's plain JSON — no XML parsing,
 * no namespaces, no encoding gotchas.
 */

import { getCollection } from 'astro:content'
import type { APIContext } from 'astro'
import { SITE_CONFIG } from '~/lib/config'

interface JsonFeedItem {
  id: string
  url: string
  title: string
  content_text: string
  summary: string
  date_published: string
  date_modified?: string
  authors: { name: string; url?: string; avatar?: string }[]
  tags: string[]
}

interface JsonFeed {
  version: 'https://jsonfeed.org/version/1.1'
  title: string
  home_page_url: string
  feed_url: string
  description: string
  authors: { name: string; url?: string }[]
  language: string
  items: JsonFeedItem[]
}

export async function GET(context: APIContext): Promise<Response> {
  const blog = await getCollection('blog', ({ data }) => data.draft === false).catch(() => [])
  const posts = await getCollection('posts', ({ data }) => data.draft === false).catch(() => [])

  const site = (context.site ?? new URL(SITE_CONFIG.url)).toString().replace(/\/$/, '')

  const items: JsonFeedItem[] = [
    ...blog.map((p) => ({
      id: `${site}/blog/${p.id}/`,
      url: `${site}/blog/${p.id}/`,
      title: p.data.title,
      content_text: p.data.description,
      summary: p.data.description,
      date_published: p.data.pubDate.toISOString(),
      date_modified: (p.data.updatedDate ?? p.data.pubDate).toISOString(),
      authors: [{ name: p.data.author, url: SITE_CONFIG.author.url }],
      tags: p.data.tags ?? [],
    })),
    ...posts.map((p) => ({
      id: `${site}/posts/${p.id}/`,
      url: `${site}/posts/${p.id}/`,
      title: p.data.title,
      content_text: p.data.description,
      summary: p.data.description,
      date_published: p.data.pubDate.toISOString(),
      date_modified: (p.data.updatedDate ?? p.data.pubDate).toISOString(),
      authors: [{ name: p.data.author, url: SITE_CONFIG.author.url }],
      tags: p.data.tags ?? [],
    })),
  ].sort((a, b) => b.date_published.localeCompare(a.date_published))

  const feed: JsonFeed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: SITE_CONFIG.title,
    home_page_url: `${site}/`,
    feed_url: `${site}/feed.json`,
    description: SITE_CONFIG.description,
    authors: [{ name: SITE_CONFIG.author.name, url: SITE_CONFIG.author.url }],
    language: SITE_CONFIG.defaultLocale,
    items,
  }

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  })
}
