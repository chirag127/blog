/**
 * /atom.xml — Atom 1.0 feed companion to /rss.xml.
 *
 * Per Batch-12 lock, every family site ships THREE feed formats:
 *   - /rss.xml  (RSS 2.0)   — handled by @astrojs/rss
 *   - /atom.xml (Atom 1.0)  — this file
 *   - /feed.json (JSON Feed 1.1) — see ./feed.json.ts
 *
 * Hand-rolled because @astrojs/rss is RSS-only. Spec:
 *   https://datatracker.ietf.org/doc/html/rfc4287
 */
import type { APIContext } from 'astro'
import { getCollection } from 'astro:content'
import { SITE_CONFIG } from '~/lib/config'

const escapeXml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export async function GET(context: APIContext): Promise<Response> {
  const blog = await getCollection('blog', ({ data }) => data.draft === false).catch(() => [])
  const posts = await getCollection('posts', ({ data }) => data.draft === false).catch(() => [])

  type Entry = { id: string; title: string; description: string; pubDate: Date; updatedDate?: Date; author: string; url: string; tags: string[] }
  const entries: Entry[] = [
    ...blog.map((p) => ({
      id: p.id,
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      updatedDate: p.data.updatedDate,
      author: p.data.author,
      url: `/blog/${p.id}/`,
      tags: p.data.tags ?? [],
    })),
    ...posts.map((p) => ({
      id: p.id,
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      updatedDate: p.data.updatedDate,
      author: p.data.author,
      url: `/posts/${p.id}/`,
      tags: p.data.tags ?? [],
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf())

  const site = (context.site ?? new URL(SITE_CONFIG.url)).toString().replace(/\/$/, '')
  const updated = entries[0]?.updatedDate ?? entries[0]?.pubDate ?? new Date()

  const items = entries
    .map((e) => {
      const link = `${site}${e.url}`
      const upd = (e.updatedDate ?? e.pubDate).toISOString()
      const cats = e.tags.map((t) => `    <category term="${escapeXml(t)}"/>`).join('\n')
      return `  <entry>
    <title>${escapeXml(e.title)}</title>
    <link href="${link}"/>
    <id>${link}</id>
    <updated>${upd}</updated>
    <published>${e.pubDate.toISOString()}</published>
    <author><name>${escapeXml(e.author)}</name></author>
    <summary>${escapeXml(e.description)}</summary>
${cats}
  </entry>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(SITE_CONFIG.title)}</title>
  <subtitle>${escapeXml(SITE_CONFIG.description)}</subtitle>
  <link href="${site}/atom.xml" rel="self" type="application/atom+xml"/>
  <link href="${site}/" rel="alternate" type="text/html"/>
  <id>${site}/</id>
  <updated>${updated.toISOString()}</updated>
  <author>
    <name>${escapeXml(SITE_CONFIG.author.name)}</name>
    <uri>${SITE_CONFIG.author.url}</uri>
    <email>${SITE_CONFIG.author.email}</email>
  </author>
  <generator uri="https://astro.build" version="6">Astro</generator>
${items}
</feed>
`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  })
}
