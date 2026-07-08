import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getCollection } from 'astro:content'
import { SITE_CONFIG } from '~/lib/config'

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => data.draft === false).catch(() => [])
  const sorted = posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())

  return rss({
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    site: context.site ?? SITE_CONFIG.url,
    items: sorted.map((p) => {
      const cats = (p.data.categories?.length ? p.data.categories : [p.data.category])
        .filter(Boolean)
        .concat(p.data.tags ?? [])
      return {
        title: p.data.title,
        description: p.data.description,
        pubDate: p.data.pubDate,
        link: `/blog/${p.id}/`,
        author: `${SITE_CONFIG.social.email} (${p.data.author})`,
        categories: [...new Set(cats)],
        customData: p.data.updatedDate
          ? `<lastBuildDate>${p.data.updatedDate.toUTCString()}</lastBuildDate>`
          : undefined,
      }
    }),
    customData: `<language>en</language><managingEditor>${SITE_CONFIG.social.email} (${SITE_CONFIG.author.name})</managingEditor><webMaster>${SITE_CONFIG.social.email} (${SITE_CONFIG.author.name})</webMaster>`,
    stylesheet: '/rss/styles.xsl',
  })
}
