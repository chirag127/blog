import type {
  BlogMetadata,
  SyndicationAdapter,
  SyndicationResult,
} from "../types";
import { mdToHtml } from "./wordpress";

export class BloggerAdapter implements SyndicationAdapter {
  id = "blogger";
  name = "Blogger";

  private async getAccessToken(
    clientId: string,
    clientSecret: string,
    refreshToken: string,
  ): Promise<string> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to refresh Google OAuth token: ${errorText}`);
    }

    const data = await response.json();
    if (!data.access_token) {
      throw new Error("Access token missing in Google OAuth response.");
    }

    return data.access_token;
  }

  async syndicate(post: BlogMetadata): Promise<SyndicationResult> {
    const blogId = process.env.BLOGGER_BLOG_ID;
    const clientId = process.env.BLOGGER_CLIENT_ID;
    const clientSecret = process.env.BLOGGER_CLIENT_SECRET;
    const refreshToken = process.env.BLOGGER_REFRESH_TOKEN;

    if (!blogId || !clientId || !clientSecret || !refreshToken) {
      return {
        success: false,
        platform: this.name,
        error:
          "Missing Blogger environment variables (BLOGGER_BLOG_ID, BLOGGER_CLIENT_ID, BLOGGER_CLIENT_SECRET, BLOGGER_REFRESH_TOKEN).",
      };
    }

    try {
      // Step 1: Programmatically resolve a fresh access token via refresh token
      const accessToken = await this.getAccessToken(
        clientId,
        clientSecret,
        refreshToken,
      );

      // Step 2: Compile Markdown to HTML and inject canonical footer
      let compiledHtml = mdToHtml(post.contentMarkdown);
      const canonicalDisclaimer = `
        <hr />
        <p style="font-style: italic; color: #555;">
          Originally published at 
          <a href="${post.canonicalUrl}" target="_blank" rel="noopener noreferrer">blog.oriz.in</a>.
        </p>
      `;
      compiledHtml += canonicalDisclaimer;

      // Step 3: Insert blogger post
      const endpoint = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          kind: "blogger#post",
          blog: {
            id: blogId,
          },
          title: post.title,
          content: compiledHtml,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          platform: this.name,
          error: `Google Blogger API error ${response.status}: ${errorText}`,
        };
      }

      const data = await response.json();
      if (!data || !data.url) {
        return {
          success: false,
          platform: this.name,
          error: "Blogger API did not return a valid published post URL.",
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
