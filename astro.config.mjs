import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import astroExpressiveCode from "astro-expressive-code";
import { defineConfig } from "astro/config";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

export default defineConfig({
  site: "https://blog.oriz.in",
  output: "static",
  integrations: [
    // Expressive Code MUST come before mdx()
    astroExpressiveCode({
      themes: ["github-dark"],
      styleOverrides: {
        borderRadius: "0.75rem",
        codePaddingBlock: "1rem",
        codePaddingInline: "1.25rem",
      },
      plugins: [
        {
          name: "Mermaid Bypass",
          hooks: {
            postprocessRenderedBlock: ({ codeBlock, renderData }) => {
              if (codeBlock.language === "mermaid") {
                renderData.blockAst = {
                  type: "element",
                  tagName: "pre",
                  properties: {
                    className: ["language-mermaid"],
                  },
                  children: [
                    {
                      type: "element",
                      tagName: "code",
                      properties: {
                        className: ["language-mermaid"],
                      },
                      children: [
                        {
                          type: "text",
                          value: codeBlock.code,
                        },
                      ],
                    },
                  ],
                };
              }
            },
          },
        },
      ],
    }),
    mdx(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "hi"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
