import * as fs from "node:fs/promises";
import * as path from "node:path";
import { DevToAdapter } from "./adapters/devto";
import { HashnodeAdapter } from "./adapters/hashnode";
import { MediumAdapter } from "./adapters/medium";
import { WordPressAdapter } from "./adapters/wordpress";
import { BloggerAdapter } from "./adapters/blogger";
import { XAdapter } from "./adapters/x";
import { IsGdShortener } from "./shortener";
import { SyndicationRegistry } from "./registry";
import type { BlogMetadata, SyndicationAdapter } from "./types";

/**
 * Robust frontmatter and Markdown parser.
 */
export function parseMarkdownPost(
  fileContent: string,
  slug: string,
): BlogMetadata | null {
  const normalized = fileContent.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---")) return null;

  const secondSeparator = normalized.indexOf("---", 3);
  if (secondSeparator === -1) return null;

  const frontmatterText = normalized.substring(3, secondSeparator).trim();
  const contentMarkdown = normalized.substring(secondSeparator + 3).trim();

  // Simple key-value parser for frontmatter
  const frontmatter: Record<string, any> = {};
  for (const line of frontmatterText.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();

    // Clean up quotes
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }

    // Parse array if bracketed
    if (value.startsWith("[") && value.endsWith("]")) {
      try {
        // Strip outer brackets and parse
        const listStr = value.substring(1, value.length - 1);
        frontmatter[key] = listStr
          .split(",")
          .map((item) => item.trim().replace(/^['"]|['"]$/g, ""))
          .filter(Boolean);
      } catch {
        frontmatter[key] = [];
      }
    } else if (value === "true") {
      frontmatter[key] = true;
    } else if (value === "false") {
      frontmatter[key] = false;
    } else {
      frontmatter[key] = value;
    }
  }

  // Mandatory fields validation with safe defaults
  const title = frontmatter.title || "";
  const description = frontmatter.description || "";
  const pubDate = frontmatter.pubDate
    ? new Date(frontmatter.pubDate)
    : new Date();
  const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [];
  const draft = frontmatter.draft === true;
  const author = frontmatter.author || "Chirag Singhal";
  const language = frontmatter.language === "hi" ? "hi" : "en";

  // Compute canonical URL based on Astro config domain
  const canonicalUrl =
    language === "hi"
      ? `https://blog.oriz.in/hi/posts/${slug}`
      : `https://blog.oriz.in/posts/${slug}`;

  return {
    title,
    description,
    pubDate,
    slug,
    contentMarkdown,
    contentHtml: "", // Managed inside adapters if necessary
    canonicalUrl,
    tags,
    draft,
    author,
    language,
  };
}

/**
 * Scan a directory recursively for markdown posts.
 */
async function getMarkdownFiles(
  dir: string,
): Promise<{ filePath: string; slug: string }[]> {
  const results: { filePath: string; slug: string }[] = [];

  async function walk(currentDir: string) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))
      ) {
        // Compute slug based on Astro routing standards
        let slug = "";
        const dirName = path.basename(currentDir);
        const fileNameWithoutExt = path.basename(
          entry.name,
          path.extname(entry.name),
        );

        if (fileNameWithoutExt === "index") {
          // If the file is index.md or index.mdx inside a folder, slug is folder name
          slug = dirName;
        } else {
          // Otherwise slug is file name
          slug = fileNameWithoutExt;
        }

        results.push({ filePath: fullPath, slug });
      }
    }
  }

  await walk(dir);
  return results;
}

/**
 * Main CLI Execution Thread
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const force = args.includes("--force");

  console.log(
    `🚀 Starting Blog Syndication. Mode: ${dryRun ? "DRY-RUN (Simulated)" : "LIVE"}`,
  );

  // Resolve dependencies
  const shortener = new IsGdShortener();
  const registry = new SyndicationRegistry();
  await registry.load();

  // Instantiate all adapters
  const adapters: SyndicationAdapter[] = [
    new DevToAdapter(),
    new HashnodeAdapter(),
    new MediumAdapter(),
    new WordPressAdapter(),
    new BloggerAdapter(),
    new XAdapter(shortener),
  ];

  // Discover and parse posts
  const blogDir = path.join(process.cwd(), "src", "content", "blog");
  let files: { filePath: string; slug: string }[] = [];

  try {
    files = await getMarkdownFiles(blogDir);
  } catch (error) {
    console.error(`Error searching for blog posts in ${blogDir}:`, error);
    process.exit(1);
  }

  console.log(
    `Found ${files.length} markdown/mdx files in ${blogDir}. Parsing contents...`,
  );

  const activePosts: BlogMetadata[] = [];
  for (const file of files) {
    try {
      const content = await fs.readFile(file.filePath, "utf-8");
      const parsed = parseMarkdownPost(content, file.slug);
      if (parsed) {
        // Skip drafts
        if (parsed.draft) {
          console.log(`[Draft] Skipping draft post: ${parsed.slug}`);
          continue;
        }
        activePosts.push(parsed);
      }
    } catch (err) {
      console.error(`Failed to parse post: ${file.filePath}`, err);
    }
  }

  console.log(
    `Loaded ${activePosts.length} active posts. Processing syndication...`,
  );

  let successCount = 0;
  let failureCount = 0;

  for (const post of activePosts) {
    console.log(`\n📄 Post: "${post.title}" (${post.slug})`);

    for (const adapter of adapters) {
      const isAlreadySyndicated = registry.isSyndicated(post.slug, adapter.id);

      if (isAlreadySyndicated && !force) {
        console.log(
          `  - [SKIP] Already posted to ${adapter.name}: ${registry.getSyndicatedUrl(post.slug, adapter.id)}`,
        );
        continue;
      }

      if (dryRun) {
        console.log(
          `  - [DRY-RUN] Would syndicate to ${adapter.name} (${adapter.id})`,
        );
        continue;
      }

      console.log(`  - [POSTING] Syndicating to ${adapter.name}...`);
      const result = await adapter.syndicate(post);

      if (result.success && result.url) {
        console.log(
          `  - [SUCCESS] Published to ${adapter.name}: ${result.url}`,
        );
        registry.recordSuccess(post.slug, adapter.id, result.url);
        successCount++;
      } else {
        console.error(
          `  - [ERROR] Failed to syndicate to ${adapter.name}: ${result.error}`,
        );
        failureCount++;
      }
    }
  }

  // Save the state ledger after processing
  if (!dryRun) {
    await registry.save();
    console.log("\n💾 Saved registry state.");
  }

  console.log(`\n🎉 Finished Blog Syndication!`);
  console.log(`   Successes: ${successCount}`);
  console.log(`   Failures: ${failureCount}`);
}

// Check if this module is run directly
if (
  process.argv[1] &&
  (process.argv[1].endsWith("run.ts") || process.argv[1].endsWith("run.js"))
) {
  main().catch((err) => {
    console.error("Fatal syndication error:", err);
    process.exit(1);
  });
}
