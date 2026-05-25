import { BlogMetadata, SyndicationAdapter, SyndicationResult } from "../types";

export class HashnodeAdapter implements SyndicationAdapter {
  id = "hashnode";
  name = "Hashnode";

  async syndicate(post: BlogMetadata): Promise<SyndicationResult> {
    const apiKey = process.env.HASHNODE_API_KEY;
    const publicationId = process.env.HASHNODE_PUBLICATION_ID;

    if (!apiKey) {
      return {
        success: false,
        platform: this.name,
        error: "Missing HASHNODE_API_KEY in environment variables.",
      };
    }

    if (!publicationId) {
      return {
        success: false,
        platform: this.name,
        error: "Missing HASHNODE_PUBLICATION_ID in environment variables.",
      };
    }

    const query = `
      mutation PublishPost($input: PublishPostInput!) {
        publishPost(input: $input) {
          post {
            id
            url
          }
        }
      }
    `;

    const variables = {
      input: {
        title: post.title,
        contentMarkdown: post.contentMarkdown,
        publicationId: publicationId,
        slug: post.slug,
        originalArticleURL: post.canonicalUrl,
      },
    };

    try {
      const response = await fetch("https://gql.hashnode.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey,
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          platform: this.name,
          error: `GraphQL HTTP Error ${response.status}: ${errorText}`,
        };
      }

      const body = await response.json();
      if (body.errors && body.errors.length > 0) {
        return {
          success: false,
          platform: this.name,
          error: `GraphQL API Error: ${body.errors.map((e: any) => e.message).join(", ")}`,
        };
      }

      const postData = body.data?.publishPost?.post;
      if (!postData || !postData.url) {
        return {
          success: false,
          platform: this.name,
          error: "GraphQL response did not return a valid published post URL.",
        };
      }

      return {
        success: true,
        platform: this.name,
        url: postData.url,
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
