export interface BlogMetadata {
  title: string;
  description: string;
  pubDate: Date;
  slug: string;
  contentMarkdown: string;
  contentHtml: string;
  canonicalUrl: string;
  tags: string[];
  heroImage?: string;
  draft: boolean;
  author: string;
  language: "en" | "hi";
}

export interface SyndicationResult {
  success: boolean;
  platform: string;
  url?: string;
  error?: string;
}

export interface SyndicationAdapter {
  id: string;
  name: string;
  syndicate(post: BlogMetadata): Promise<SyndicationResult>;
}

export interface LinkShortener {
  shorten(longUrl: string): Promise<string>;
}
