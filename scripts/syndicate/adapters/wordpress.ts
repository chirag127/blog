import type {
  BlogMetadata,
  SyndicationAdapter,
  SyndicationResult,
} from "../types";

/**
 * A highly robust, lightweight Markdown to HTML compiler that runs client-side / script-side
 * without needing extra npm dependencies.
 */
export function mdToHtml(md: string): string {
  // Normalize line endings
  let text = md.replace(/\r\n/g, "\n");

  // Remove metadata block (frontmatter) if present
  if (text.startsWith("---")) {
    const end = text.indexOf("---", 3);
    if (end !== -1) {
      text = text.substring(end + 3);
    }
  }

  // Escape basic HTML entities to avoid broken tags
  text = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code Blocks
  text = text.replace(/```(\w*)\n?([\s\S]*?)```/gm, (_match, lang, code) => {
    const classAttr = lang ? ` class="language-${lang}"` : "";
    return `<pre><code${classAttr}>${code.trim()}</code></pre>`;
  });

  // Inline Code
  text = text.replace(/`([^`\n]+)`/g, "<code>$1</code>");

  // Headers (h1-h6)
  text = text.replace(/^(#{1,6})\s+(.+)$/gm, (_match, hashes, content) => {
    const level = hashes.length;
    return `<h${level}>${content.trim()}</h${level}>`;
  });

  // Images: ![alt](url) -> <img src="url" alt="alt" />
  text = text.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" style="max-width:100%; height:auto;" />',
  );

  // Links: [text](url) -> <a href="url">text</a>
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Bold
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/__([^_]+)__/g, "<strong>$1</strong>");

  // Italic
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  text = text.replace(/_([^_]+)_/g, "<em>$1</em>");

  // Paragraphs and double-newlines
  const blocks = text.split(/\n\n+/);
  const formattedBlocks = blocks.map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    if (
      trimmed.startsWith("<h") ||
      trimmed.startsWith("<pre") ||
      trimmed.startsWith("<img")
    ) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
  });

  return formattedBlocks.filter(Boolean).join("\n");
}

export class WordPressAdapter implements SyndicationAdapter {
  id = "wordpress";
  name = "WordPress";

  async syndicate(post: BlogMetadata): Promise<SyndicationResult> {
    const wpUrl = process.env.WORDPRESS_URL; // e.g. https://your-wp-site.com
    const username = process.env.WORDPRESS_USERNAME;
    const appPassword = process.env.WORDPRESS_APP_PASSWORD;

    if (!wpUrl || !username || !appPassword) {
      return {
        success: false,
        platform: this.name,
        error:
          "Missing WORDPRESS_URL, WORDPRESS_USERNAME, or WORDPRESS_APP_PASSWORD in environment.",
      };
    }

    // Prepare credentials header
    const credentials = Buffer.from(`${username}:${appPassword}`).toString(
      "base64",
    );

    // Standardize URL structure
    const baseUrl = wpUrl.endsWith("/") ? wpUrl.slice(0, -1) : wpUrl;
    const endpoint = `${baseUrl}/wp-json/wp/v2/posts`;

    // Compile Markdown to HTML
    let compiledHtml = mdToHtml(post.contentMarkdown);

    // Append Canonical link disclaimer as a fail-safe inside the post body itself
    const canonicalDisclaimer = `
      <hr />
      <p style="font-style: italic; color: #666;">
        This article was originally published on 
        <a href="${post.canonicalUrl}" target="_blank" rel="noopener noreferrer">blog.oriz.in</a>.
      </p>
    `;
    compiledHtml += canonicalDisclaimer;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({
          title: post.title,
          content: compiledHtml,
          excerpt: post.description,
          status: "publish",
          slug: post.slug,
          // Supply multiple canonical meta key possibilities for various SEO plugins
          meta: {
            _canonical_url: post.canonicalUrl,
            _yoast_wpseo_canonical: post.canonicalUrl,
            rank_math_canonical_url: post.canonicalUrl,
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
      if (!data || !data.link) {
        return {
          success: false,
          platform: this.name,
          error: "WordPress API response did not include a valid post link.",
        };
      }

      return {
        success: true,
        platform: this.name,
        url: data.link,
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
