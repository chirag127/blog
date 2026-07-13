import type { LinkShortener } from "./types";

export class IsGdShortener implements LinkShortener {
  private apiEndpoint = "https://is.gd/create.php";

  async shorten(longUrl: string): Promise<string> {
    const requestUrl = `${this.apiEndpoint}?format=json&url=${encodeURIComponent(longUrl)}`;

    try {
      const response = await fetch(requestUrl);
      if (!response.ok) {
        throw new Error(`is.gd HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.errorcode) {
        throw new Error(
          `is.gd API Error [${data.errorcode}]: ${data.errormessage}`,
        );
      }

      if (!data.shorturl) {
        throw new Error("is.gd response missing shorturl property");
      }

      return data.shorturl;
    } catch (error) {
      console.error(
        `Failed to shorten URL: ${longUrl}. Falling back to original URL. Error:`,
        error,
      );
      // Return the long URL as fallback to avoid crashing the syndication pipeline
      return longUrl;
    }
  }
}
