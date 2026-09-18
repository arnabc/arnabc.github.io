import { getRelativeLocaleUrl } from "astro:i18n";
import config from "@/config";

/**
 * Returns the slug-only path for use as a route param in `getStaticPaths`.
 * No base prefix, no locale — Astro handles those at a higher level.
 * e.g. `/2010/01/my-post`
 */
export function getPostSlug(id: string, pubDatetime: Date): string {
  const year = String(pubDatetime.getUTCFullYear());
  const month = String(pubDatetime.getUTCMonth() + 1).padStart(2, "0");
  return `/${year}/${month}/${id}`;
}

/**
 * Returns a fully navigable URL for use in `<a href>` and RSS links.
 * Applies both locale routing and the configured Astro base via
 * `getRelativeLocaleUrl`.
 * e.g. `/blog/2010/01/my-post`
 */
export function getPostUrl(
  id: string,
  pubDatetime: Date,
  locale: string | undefined = config.site.lang,
): string {
  return getRelativeLocaleUrl(locale, `blog${getPostSlug(id, pubDatetime)}`);
}
