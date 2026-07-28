# Blog Migration: Octopress → Astro + Markdoc + Keystatic

## Goal
Migrate `arnabc.github.io` from Octopress to a modern static site, while
preserving all existing content and URLs (or adding permanent redirects),
then retiring the Octopress codebase cleanly.

## Before you start
- We are on a local checkout of the `arnabc.github.io` repo.
- **Create a new working branch off the current `master` first** — do not
  commit any of this work directly to `master`. Suggested branch name:
  `migrate/astro-markdoc`.
- Do not delete or force-push anything on `master` or `source` at any point
  in this task. All destructive/cleanup steps below are explicitly marked
  and should only run after I confirm.

## Current repo state
- `master` branch: compiled Octopress output (static HTML, `atom.xml`,
  `sitemap.xml`, `CNAME`, `blog/` directory of rendered posts).
- `source` branch: raw Octopress source, posts live under
  `source/_posts/*.markdown` with YAML frontmatter, and use Octopress
  Liquid tags (`{% blockquote %}`, `{% img %}`, `{% codeblock %}`, etc.)
  which need to be converted since Markdoc does not understand Liquid.
- Existing permalink structure to preserve exactly:
  `/blog/YYYY/MM/slug-title/` — confirm this from actual post URLs in
  `source/_posts` filenames (Octopress default: `YYYY-MM-DD-slug.markdown`).
- Site uses a custom domain via the root `CNAME` file.

## Target stack (decided)
- **Astro** (latest — v7, which runs on Vite 8) as the site framework,
  static output.
- **Markdoc** as the content format (`@astrojs/markdoc` integration),
  replacing Octopress/Liquid markdown.
- **Keystatic** as the git-backed content editor/CMS, using
  `fields.markdoc()`, with `storage: { kind: 'github' }` so a third-party
  reviewer can edit/approve posts via a web UI without touching git
  directly — this should open PRs against the working repo.
- **Cloudflare Pages** as the deploy target (free tier: unlimited
  bandwidth/requests, automatic PR preview deployments, 500 builds/month).
  This replaces GitHub Pages as the host.
- Site requirements: text-only layout, CSS grid, sidebar, dark/light mode
  (respect `prefers-color-scheme` + toggle), RSS feed, reading-mode-friendly
  semantic HTML (`<article>`, `<time>`, single H1 per page), SEO/AI-friendly
  (sitemap.xml, JSON-LD Article schema, robots.txt allowing AI crawlers).

## Repo structure (decided)
Two-repo split:
1. A **template repo** (new, separate — do not create in this task, just
   leave a placeholder note) that will hold all reusable plumbing: Astro
   config, theme/layout, Markdoc config, Keystatic config, CLI tooling,
   Cloudflare Pages deploy config. Will be MIT-licensed.
2. **This repo** (`arnabc.github.io`) becomes the content repo: real posts
   live under `src/content/`, licensed CC BY-NC 4.0. It will later add the
   template repo as a git remote named `template` (not a GitHub
   "use this template" fork) so plumbing fixes can be pulled in with
   `git fetch template && git merge template/main`. Do not set this remote
   up yet — just structure the repo so `src/content/` is cleanly separated
   from everything else, to make this trivial later.

## Steps to perform

1. Create and check out branch `migrate/astro-markdoc` from `master`.

2. Scaffold a fresh Astro 7 project structure in this branch (do not merge
   with old Octopress files — build alongside, we'll remove Octopress
   files in a later step once the new site is verified working).

3. Set up `@astrojs/markdoc` and a content collection schema for blog
   posts (title, date, tags, draft: boolean, description) matching what
   Keystatic's `fields.markdoc()` expects.

4. Extract posts from the `source` branch: read `source/_posts/*.markdown`
   (via `git show source:source/_posts/<file>` or a worktree checkout of
   `source`), for each post:
   - Convert frontmatter to the new schema.
   - Convert Octopress `codeblock` Liquid tags to plain fenced code
     blocks — this is the ONLY Liquid tag used across all 9 posts
     (confirmed by scanning the source branch), so no other tag
     conversion should be needed. The exact rule:
     ```
     {% codeblock lang:LANGUAGE %}
     ...code...
     {% endcodeblock %}
     ```
     becomes:
     ````
     ```LANGUAGE
     ...code...
     ```
     ````
     If you encounter a `codeblock` tag with additional arguments beyond
     `lang:` (e.g. a title, URL, or link text — the fuller Octopress
     syntax supports these), STOP and flag it for my review rather than
     guessing how to handle it, since none of the confirmed examples use
     those args.
   - Preserve the exact original slug/date so the URL can be reproduced.
   - Write the result to `src/content/blog/` in this new branch.
   Also copy any referenced images from `source` into `public/` or an
   appropriate assets directory, updating references.
   - 4 of the 9 posts contain no Liquid tags at all and can convert with
     just a frontmatter reshape:
     `source/_posts/2010-01-10-10-things-a-frontend-engineer-should-know.markdown`,
     `source/_posts/2011-12-05-phonegap-how-does-it-work.markdown`,
     `source/_posts/2012-09-01-danger-of-using-same-password-everywhere.markdown`,
     `source/_posts/2012-09-30-android-how-to-send-gzipped-json-in-http-request.markdown`,
     `source/_posts/2013-11-17-developing-kiosk-mode-applications-in-android.markdown`

5. Build the route structure so post URLs exactly match the original
   `/blog/YYYY/MM/slug/` pattern, driven by each post's frontmatter date —
   goal is zero redirects needed for posts. If any non-post URLs (e.g.
   `/blog/archives`, `/about`) can't be reproduced exactly, list them for
   me rather than silently dropping them — I'll decide on redirects.

6. Set up Keystatic config with GitHub storage mode pointing at this repo.

7. Add Cloudflare Pages build config (wrangler config or Pages project
   settings as needed) for git-based deploy.

8. **Do not perform yet, list as pending for my review:**
   - Removing old Octopress files (`Rakefile`, `Gemfile`, `_config.yml`,
     `plugins/`, `sass/`, `.themes/`, compiled `blog/` HTML, `atom.xml`,
     `sitemap.xml`, root `CNAME`) — I'll confirm removal after verifying
     the new site builds and renders correctly.
   - Disabling GitHub Pages in repo settings.
   - Tagging/archiving `master` as `legacy/octopress-final`.
   - Any DNS/domain cutover — this happens outside git entirely, last,
     after the new site is verified live on a Cloudflare Pages preview URL.

## What to report back when done
- Summary of posts migrated, and any that failed conversion or had
  ambiguous Liquid tags needing my input.
- Any URLs that can't be exactly reproduced (for redirect decisions).
- Confirmation of what's still pending per step 8 above, awaiting my go-ahead.
