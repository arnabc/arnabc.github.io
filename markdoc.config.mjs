import { defineMarkdocConfig, nodes } from '@astrojs/markdoc/config';
import { unescapeHTML } from 'astro/runtime/server/index.js';
import { createHighlighter, createJavaScriptRegexEngine } from 'shiki';

// Cloudflare Workers disallows dynamic WebAssembly.instantiate(), which Shiki's
// default Oniguruma engine relies on — use the pure-JS regex engine instead,
// and build one shared highlighter up front rather than relying on Shiki's
// module-level singleton (whose engine choice can be pinned by an earlier,
// unrelated caller before our config runs).
let highlighterPromise;
function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: ['javascript', 'xml', 'java', 'bash', 'sh', 'ruby', 'text'],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighterPromise;
}

export default defineMarkdocConfig({
  nodes: {
    fence: {
      ...nodes.fence,
      transform: async (node) => {
        const content = node.attributes.content;
        const language = node.attributes.language || 'text';
        const highlighter = await getHighlighter();
        const html = highlighter.codeToHtml(content, {
          lang: highlighter.getLoadedLanguages().includes(language) ? language : 'text',
          themes: { light: 'github-light', dark: 'github-dark' },
          defaultColor: false,
        });
        return unescapeHTML(html);
      },
    },
  },
});
