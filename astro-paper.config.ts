import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://arnab.ch/",
    title: "Arnab Chakraborty",
    tagline: "What building things teaches you",
    description:
      "Arnab Chakraborty on software, scale and security — working through what a decade of building Scalefusion, and the team behind it, actually taught me.",
    author: "Arnab Chakraborty",
    ogImage: "default-og.jpg",
    lang: "en",
    timezone: "UTC",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    // Disabled: sharp (used for PNG encoding) needs native Node bindings,
    // which can't run in Cloudflare Workers' V8-isolate sandbox — not even
    // at prerender time, since the Cloudflare adapter prerenders through a
    // workerd emulation. Falls back to the static site.ogImage file above.
    dynamicOgImage: false,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  // No social media / share links — see site design requirements memory.
  socials: [],
  shareLinks: [],
});
