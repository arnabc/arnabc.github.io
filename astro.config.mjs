// @ts-check
import { defineConfig } from 'astro/config';

import markdoc from '@astrojs/markdoc';

import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';

import react from '@astrojs/react';

import keystatic from '@keystatic/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://arnab.ch',
  integrations: [markdoc({ allowHTML: true }), sitemap(), react(), keystatic()],
  adapter: cloudflare()
});