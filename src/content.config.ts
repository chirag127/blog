/**
 * Content collections — strict schema for the `blog` collection.
 *
 * Canonical fields used by every route + component:
 *   title, description, pubDate                  required
 *   updatedDate, heroImage, tags, category       typed
 *   categories                                   array fallback (legacy)
 *   draft, author, series, part                  typed
 *   canonical                                    URL
 *   readingTime                                  auto-computed if absent
 *
 * The 20 book-summary posts ported from open-ncert ship a few extra fields
 * (slug, authorBio, seriesOrder, coverImage, coverImageAlt, platforms,
 * schema, keywords, showAds). The schema lists those as optional
 * passthroughs so they validate without hand-editing.
 */
import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    // Required
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),

    // Strongly typed optionals
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    tags: z
      .preprocess((v) => {
        if (v == null) return []
        if (Array.isArray(v)) return v
        if (typeof v === 'string') {
          const trimmed = v.trim()
          // Some MDX files have flow-style YAML that round-trips as a single string,
          // e.g. `tags: ["a", "b"]` ends up as the literal string `["a", "b"]`.
          if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
              const parsed = JSON.parse(trimmed)
              if (Array.isArray(parsed)) return parsed.map(String)
            } catch {
              /* fall through */
            }
          }
          return trimmed
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        }
        return v
      }, z.array(z.string()))
      .default([]),
    category: z.string().default('General'),
    /** Some posts emit plural `categories` instead of singular. Either is fine. */
    categories: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
    author: z.string().default('Chirag Singhal'),
    series: z.string().optional(),
    part: z.union([z.string(), z.number()]).optional(),
    /** Auto-computed at render-time if absent. Some legacy posts ship a number. */
    readingTime: z.union([z.string(), z.number()]).optional(),
    canonical: z.string().url().optional(),
    featured: z.boolean().optional(),
    /** Cross-post canonical (posts merged in from the old `posts` collection). */
    canonicalUrl: z.string().url().optional(),

    // Legacy passthroughs (book-summary collection ported from open-ncert)
    slug: z.string().optional(),
    authorBio: z.string().optional(),
    seriesOrder: z.union([z.number(), z.string()]).optional(),
    coverImage: z.string().optional(),
    coverImageAlt: z.string().optional(),
    platforms: z.union([z.array(z.string()), z.record(z.string(), z.unknown())]).optional(),
    schema: z.unknown().optional(),
    keywords: z.array(z.string()).optional(),
    showAds: z.boolean().optional(),
  }),
})

/**
 * Single content collection. The old `posts` collection (12 spec-conformant
 * entries) was merged into `blog` (2026-08-05) — one collection, one schema,
 * one route family (`/blog/<slug>/`). Old `/posts/*` URLs redirect in
 * astro.config.mjs.
 */
export const collections = {
  blog,
}
