import type {
  BlogMetadata,
  SyndicationAdapter,
  SyndicationResult,
} from "../types";

export class MediumAdapter implements SyndicationAdapter {
  id = "medium";
  name = "Medium";

  async syndicate(post: BlogMetadata): Promise<SyndicationResult> {
    const token = process.env.MEDIUM_INTEGRATION_TOKEN;
    if (!token) {
      return {
        success: false,
        platform: this.name,
        error: "Missing MEDIUM_INTEGRATION_TOKEN in environment variables.",
      };
    }

    try {
      // Step 1: Retrieve User Details (Dynamic Author ID)
      const userResponse = await fetch("https://api.medium.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        return {
          success: false,
          platform: this.name,
          error: `Failed to resolve Medium profile [HTTP ${userResponse.status}]: ${errorText}`,
        };
      }

      // Medium API responses sometimes wrap their JSON in an anti-hijacking wrapper: `]}'\n`
      let userBodyText = await userResponse.text();
      if (userBodyText.startsWith("])}';")) {
        userBodyText = userBodyText.substring(5).trim();
      } else if (userBodyText.startsWith("]}'\n")) {
        userBodyText = userBodyText.substring(4).trim();
      }

      const userData = JSON.parse(userBodyText);
      const userId = userData.data?.id;
      if (!userId) {
        return {
          success: false,
          platform: this.name,
          error: "Could not locate author ID in Medium profile response.",
        };
      }

      // Step 2: Publish the Post
      // We prepend the Title to the Markdown body because Medium relies on headings inside the body
      const markdownBody = `# ${post.title}\n\n${post.contentMarkdown}`;

      const publishResponse = await fetch(
        `https://api.medium.com/v1/users/${userId}/posts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            title: post.title,
            contentFormat: "markdown",
            content: markdownBody,
            canonicalUrl: post.canonicalUrl,
            publishStatus: "public", // Publish immediately as public
            tags: post.tags.slice(0, 5), // Medium allows up to 5 tags
          }),
        },
      );

      if (!publishResponse.ok) {
        const errorText = await publishResponse.text();
        return {
          success: false,
          platform: this.name,
          error: `HTTP Error ${publishResponse.status}: ${errorText}`,
        };
      }

      let publishBodyText = await publishResponse.text();
      if (publishBodyText.startsWith("])}';")) {
        publishBodyText = publishBodyText.substring(5).trim();
      } else if (publishBodyText.startsWith("]}'\n")) {
        publishBodyText = publishBodyText.substring(4).trim();
      }

      const publishData = JSON.parse(publishBodyText);
      const postUrl = publishData.data?.url;
      if (!postUrl) {
        return {
          success: false,
          platform: this.name,
          error:
            "Medium response did not include a valid published article URL.",
        };
      }

      return {
        success: true,
        platform: this.name,
        url: postUrl,
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
