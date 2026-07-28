import type { CollectionEntry } from 'astro:content';

export function postUrl(post: CollectionEntry<'blog'>): string {
  const year = post.data.date.getUTCFullYear();
  const month = String(post.data.date.getUTCMonth() + 1).padStart(2, '0');
  return `/blog/${year}/${month}/${post.id}/`;
}

export function tagUrl(tag: string): string {
  return `/blog/categories/${tag.toLowerCase().replace(/\s+/g, '-')}/`;
}
