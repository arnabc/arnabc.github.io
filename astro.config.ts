import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import markdoc from "@astrojs/markdoc";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import keystatic from "@keystatic/astro";
import cloudflare from "@astrojs/cloudflare";
import { unified } from "@astrojs/markdown-remark";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import rehypeCallouts from "rehype-callouts";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import config from "./astro-paper.config";

export default defineConfig({
  site: config.site.url,
  integrations: [
    mdx(),
    markdoc({ allowHTML: true }),
    sitemap({
      filter: (page) =>
        config.features?.showArchives !== false || !page.endsWith("/archives/"),
    }),
    react(),
    keystatic(),
  ],
  adapter: cloudflare(),
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkToc,
        [remarkCollapse, { test: "Table of contents" }],
      ],
      rehypePlugins: [rehypeCallouts],
    }),
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      name: "DM Sans",
      cssVariable: "--font-dm-sans",
      provider: fontProviders.google(),
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
      weights: [400, 500, 600, 700],
      styles: ["normal", "italic"],
      formats: ["woff2", "woff"],
    },
    {
      name: "Source Serif 4",
      cssVariable: "--font-source-serif",
      provider: fontProviders.google(),
      fallbacks: ["ui-serif", "Georgia", "Cambria", "serif"],
      weights: [400, 600],
      styles: ["normal", "italic"],
      formats: ["woff2", "woff"],
    },
    {
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains-mono",
      provider: fontProviders.google(),
      fallbacks: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      weights: [400, 500],
      styles: ["normal"],
      formats: ["woff2", "woff"],
    },
  ],
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
      PUBLIC_KEYSTATIC_GITHUB_REPO: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
      PUBLIC_CF_WEB_ANALYTICS_TOKEN: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
