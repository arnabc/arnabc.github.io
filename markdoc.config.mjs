import { defineMarkdocConfig, nodes } from '@astrojs/markdoc/config';
import { unescapeHTML } from 'astro/runtime/server/index.js';
import { createHighlighter, createJavaScriptRegexEngine } from 'shiki';
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from '@shikijs/transformers';
import { transformerFileName } from './src/utils/transformers/fileName.js';

// Cloudflare Workers disallows dynamic WebAssembly.instantiate(), which Shiki's
// default Oniguruma engine relies on — use the pure-JS regex engine instead,
// and build one shared highlighter up front rather than relying on Shiki's
// module-level singleton (whose engine choice can be pinned by an earlier,
// unrelated caller before our config runs).
let highlighterPromise;
function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: ['min-light', 'night-owl'],
    langs: ['javascript', 'xml', 'java', 'bash', 'sh', 'ruby', 'text'],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighterPromise;
}

// Mirrors `markdown.shikiConfig.transformers` in astro.config.ts, which only
// covers .md/.mdx — Markdoc renders fences through this node instead, so the
// transformers have to be passed to Shiki here as well or they never run.
const transformers = [
  transformerFileName({ style: 'v2', hideDot: false }),
  transformerNotationHighlight(),
  transformerNotationWordHighlight(),
  transformerNotationDiff({ matchAlgorithm: 'v3' }),
];

export default defineMarkdocConfig({
  nodes: {
    fence: {
      ...nodes.fence,
      attributes: {
        ...(nodes.fence.attributes ?? {}),
        // Markdoc drops a fence's info-string meta (```js file="x.js"), so the
        // file name comes in as a Markdoc annotation instead:
        //   ```js {% file="x.js" %}
        file: { type: String, render: false },
      },
      transform: async (node) => {
        // Markdoc's fence content keeps the newline that closed the block, and
        // Shiki turns that into a trailing empty <span class="line"></span> —
        // a blank row at the bottom of every code block.
        const content = node.attributes.content.replace(/\n+$/, '');
        const language = node.attributes.language || 'text';
        const file = node.attributes.file;
        const highlighter = await getHighlighter();
        const html = highlighter.codeToHtml(content, {
          lang: highlighter.getLoadedLanguages().includes(language) ? language : 'text',
          themes: { light: 'min-light', dark: 'night-owl' },
          defaultColor: false,
          // transformerFileName reads the raw meta string, which Markdoc has
          // already parsed away — hand it back the shape it expects.
          ...(file ? { meta: { __raw: `file="${file}"` } } : {}),
          transformers,
        });
        return unescapeHTML(html);
      },
    },
  },
});
