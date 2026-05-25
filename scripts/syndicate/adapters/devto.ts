import { BlogMetadata, SyndicationAdapter, SyndicationResult } from "../types";

export class DevToAdapter implements SyndicationAdapter {
  id = "devto";
  name = "Dev.to";

  async syndicate(post: BlogMetadata): Promise<SyndicationResult> {
    const apiKey = process.env.DEVTO_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        platform: this.name,
        error: "Missing DEVTO_API_KEY in environment variables.",
      };
    }

    try {
      const response = await fetch("https://dev.to/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
          "Accept": "application/vnd.forem.api-v1+json",
        },
        body: JSON.stringify({
          article: {
            title: post.title,
            body_markdown: post.contentMarkdown,
            published: true, // Set to true to publish immediately
            canonical_url: post.canonicalUrl,
            tags: post.tags.slice(0, 4), // Dev.to accepts up to 4 tags
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          platform: this.name,
          error: `HTTP Error ${response.status}: ${errorText}`,
        };
      }

      const data = await response.json();
      if (!data || !data.url) {
        return {
          success: false,
          platform: this.name,
          error: "API response did not return a valid article URL.",
        };
      }

      return {
        success: true,
        platform: this.name,
        url: data.url,
      };
    } catch (error: any) {
      return {
        success: false,
        platform: this.name,
        error: error.message || String(error),
      };
    }
  }
}
