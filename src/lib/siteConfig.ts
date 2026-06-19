/**
 * Shared oriz-family site descriptor.
 *
 * The blog has its own richer src/config.ts (SITE_CONFIG) covering author /
 * social / giscus / newsletter, used by the existing BaseLayout, Header,
 * Footer, etc. This file exists in addition to it so that auth + legal pages
 * (and any future @chirag127/oriz-ui shared components) can reach the slim
 * descriptor every other oriz site exposes under the same name.
 */
export interface OrizSiteConfig {
  slug: string;
  name: string;
  origin: string;
  tagline: string;
  description: string;
}

export const ORIZ_SITE_CONFIG: OrizSiteConfig = {
  slug: "blog",
  name: "Blog",
  origin: "https://blog.oriz.in",
  tagline: "Long-form writing on engineering, finance, and books",
  description: "Long-form writing on engineering, finance, and books",
};
