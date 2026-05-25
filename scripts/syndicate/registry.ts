import * as fs from "node:fs/promises";
import * as path from "node:path";

export interface RegistryState {
  [slug: string]: {
    [platformId: string]: string; // Maps platform ID (e.g., 'devto') to published URL
  };
}

export class SyndicationRegistry {
  private registryPath: string;
  private state: RegistryState = {};

  constructor(customPath?: string) {
    // Default to src/content/syndication-registry.json relative to project root
    this.registryPath = customPath || path.join(process.cwd(), "src", "content", "syndication-registry.json");
  }

  async load(): Promise<void> {
    try {
      const exists = await fs.access(this.registryPath).then(() => true).catch(() => false);
      if (!exists) {
        this.state = {};
        return;
      }
      const data = await fs.readFile(this.registryPath, "utf-8");
      this.state = JSON.parse(data);
    } catch (error) {
      console.warn(`Failed to read syndication registry at ${this.registryPath}, initializing empty.`, error);
      this.state = {};
    }
  }

  async save(): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.registryPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(this.registryPath, JSON.stringify(this.state, null, 2), "utf-8");
    } catch (error) {
      console.error(`Failed to write syndication registry to ${this.registryPath}`, error);
      throw error;
    }
  }

  isSyndicated(slug: string, platformId: string): boolean {
    return !!(this.state[slug] && this.state[slug][platformId]);
  }

  getSyndicatedUrl(slug: string, platformId: string): string | undefined {
    return this.state[slug]?.[platformId];
  }

  recordSuccess(slug: string, platformId: string, url: string): void {
    if (!this.state[slug]) {
      this.state[slug] = {};
    }
    this.state[slug][platformId] = url;
  }

  getAllRecordsForPost(slug: string): Record<string, string> {
    return this.state[slug] || {};
  }
}
