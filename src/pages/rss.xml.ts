import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getCollection } from 'astro:content'
import { SITE_CONFIG } from '~/lib/config'

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => data.draft === false).catch(() => [])
  return rss({
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    site: context.site ?? SITE_CONFIG.url,
    items: posts
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((p) => ({
        title: p.data.title,
        description: p.data.description,
        pubDate: p.data.pubDate,
        link: `/blog/${p.id}/`,
        author: `${SITE_CONFIG.social.email} (${p.data.author})`,
        categories: [p.data.category, ...p.data.tags],
      })),
    customData: '<language>en</language>',
  })
}
