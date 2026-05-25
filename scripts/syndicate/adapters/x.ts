import * as crypto from "node:crypto";
import { BlogMetadata, LinkShortener, SyndicationAdapter, SyndicationResult } from "../types";

/**
 * Robust, zero-dependency helper to generate Twitter/X OAuth 1.0a Authorization Headers.
 */
export function generateOAuth1Header(
  method: string,
  url: string,
  bodyParams: Record<string, string>,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessTokenSecret: string
): string {
  const nonce = crypto.randomBytes(32).toString("hex");
  const timestamp = Math.floor(Date.now() / 1000).toString();

  // Combine and sort all OAuth and body parameters
  const params: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: "1.0",
    ...bodyParams,
  };

  // Percent-encode string according to RFC 3986 specs
  const percentEncode = (str: string): string => {
    return encodeURIComponent(str)
      .replace(/!/g, "%21")
      .replace(/'/g, "%27")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29")
      .replace(/\*/g, "%2A");
  };

  // Sort parameters alphabetically by key
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys
    .map((key) => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join("&");

  // Create signature base string
  const signatureBase = `${method.toUpperCase()}&${percentEncode(url)}&${percentEncode(paramString)}`;

  // Create signing key
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(accessTokenSecret)}`;

  // Calculate HMAC-SHA1 signature
  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(signatureBase)
    .digest("base64");

  // Format OAuth Header
  const headerParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature: signature,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  return (
    "OAuth " +
    Object.entries(headerParams)
      .map(([key, val]) => `${percentEncode(key)}="${percentEncode(val)}"`)
      .join(", ")
  );
}

export class XAdapter implements SyndicationAdapter {
  id = "x";
  name = "X (Twitter)";

  constructor(private shortener: LinkShortener) {}

  async syndicate(post: BlogMetadata): Promise<SyndicationResult> {
    const consumerKey = process.env.X_CONSUMER_KEY;
    const consumerSecret = process.env.X_CONSUMER_SECRET;
    const accessToken = process.env.X_ACCESS_TOKEN;
    const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

    if (!consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) {
      return {
        success: false,
        platform: this.name,
        error: "Missing X/Twitter API credentials in environment (X_CONSUMER_KEY, X_CONSUMER_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET).",
      };
    }

    try {
      // Step 1: Shorten URL using the supplied shortener service
      const shortUrl = await this.shortener.shorten(post.canonicalUrl);

      // Step 2: Compose text and truncate cleanly to preserve character limits (280 characters)
      const MAX_TWEET_LENGTH = 280;
      const footer = `\n\nRead more: ${shortUrl}`;
      const availableLength = MAX_TWEET_LENGTH - footer.length;

      // Basic tweet structure: "Title\n\nDescription"
      let text = `${post.title}\n\n${post.description}`;

      if (text.length > availableLength) {
        // We must truncate the description to fit the limit
        const titlePart = `${post.title}\n\n`;
        const dots = "...";
        const maxDescLength = availableLength - titlePart.length - dots.length;

        if (maxDescLength > 0) {
          const truncatedDesc = post.description.slice(0, maxDescLength);
          text = `${titlePart}${truncatedDesc}${dots}`;
        } else {
          // If title is exceptionally long, truncate title itself
          text = post.title.slice(0, availableLength - dots.length) + dots;
        }
      }

      const tweetText = `${text}${footer}`;
      const endpoint = "https://api.twitter.com/2/tweets";

      // Step 3: Authorize request using Custom OAuth 1.0a signatures
      const authHeader = generateOAuth1Header(
        "POST",
        endpoint,
        {}, // Empty since API v2 sends data in JSON body rather than query params / urlencoded forms
        consumerKey,
        consumerSecret,
        accessToken,
        accessTokenSecret
      );

      // Step 4: Dispatch JSON POST request to Twitter API v2
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: tweetText,
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
      const tweetId = data.data?.id;
      if (!tweetId) {
        return {
          success: false,
          platform: this.name,
          error: "X API response did not include a valid tweet ID.",
        };
      }

      return {
        success: true,
        platform: this.name,
        url: `https://x.com/user/status/${tweetId}`,
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
