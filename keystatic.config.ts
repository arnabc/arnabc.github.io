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
        date: fields.datetime({ label: 'Date', validation: { isRequired: true } }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value || 'Tag',
        }),
        draft: fields.checkbox({ label: 'Draft', defaultValue: false }),
        description: fields.text({ label: 'Description', multiline: true }),
        content: fields.markdoc({ label: 'Content', extension: 'mdoc' }),
      },
    }),
  },
  singletons: {
    about: singleton({
      label: 'About page',
      path: 'src/content/about',
      format: { contentField: 'content' },
      schema: {
        title: fields.text({ label: 'Title' }),
        description: fields.text({ label: 'Description', multiline: true }),
        content: fields.markdoc({ label: 'Content', extension: 'mdoc' }),
      },
    }),
  },
});
