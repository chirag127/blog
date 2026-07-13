export interface OrizSiteConfig {
  slug: string
  name: string
  origin: string
  tagline: string
  description?: string
}

export const SITE_CONFIG: OrizSiteConfig = {
  slug: 'blog',
  name: 'Blog',
  origin: 'https://blog.oriz.in',
  tagline: 'Long-form writing on engineering, finance, and books',
  description: 'Long-form writing on engineering, finance, and books — by Chirag Singhal.',
}
