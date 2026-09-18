import { config, fields, collection, singleton } from '@keystatic/core';

const githubRepo = import.meta.env.PUBLIC_KEYSTATIC_GITHUB_REPO;

export default config({
  storage: githubRepo
    ? { kind: 'github', repo: githubRepo }
    : { kind: 'local' },
  collections: {
    blog: collection({
      label: 'Blog posts',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        pubDatetime: fields.datetime({ label: 'Published', validation: { isRequired: true } }),
        modDatetime: fields.datetime({ label: 'Last modified' }),
        author: fields.text({ label: 'Author', description: 'Defaults to the site author if left blank.' }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value || 'Tag',
        }),
        featured: fields.checkbox({ label: 'Featured', description: 'Pin to the top of the homepage.', defaultValue: false }),
        draft: fields.checkbox({ label: 'Draft', defaultValue: false }),
        description: fields.text({ label: 'Description', multiline: true }),
        ogImage: fields.text({ label: 'OG image', description: 'Optional custom Open Graph image path/URL. Leave blank to auto-generate.' }),
        canonicalURL: fields.url({ label: 'Canonical URL' }),
        hideEditPost: fields.checkbox({ label: 'Hide "edit post" link', defaultValue: false }),
        timezone: fields.text({ label: 'Timezone', description: 'IANA timezone, e.g. Asia/Kolkata. Defaults to the site timezone.' }),
        content: fields.markdoc({ label: 'Content', extension: 'mdoc' }),
      },
    }),
  },
  singletons: {
    about: singleton({
      label: 'About page',
      path: 'src/content/pages/about',
      format: { contentField: 'content' },
      schema: {
        title: fields.text({ label: 'Title' }),
        description: fields.text({ label: 'Description', multiline: true }),
        ogImage: fields.text({ label: 'OG image' }),
        canonicalURL: fields.url({ label: 'Canonical URL' }),
        content: fields.markdoc({ label: 'Content', extension: 'mdoc' }),
      },
    }),
  },
});
