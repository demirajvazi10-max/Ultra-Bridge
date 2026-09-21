import {defineField, defineType} from 'sanity'

export const guide = defineType({
  name: 'guide',
  title: 'Guide',
  type: 'document',
  description: 'A short explanatory article. These are also indexed into the Knowledge Base.',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: (r) => r.required()}),
    defineField({name: 'audience', type: 'string'}),
    defineField({name: 'summary', type: 'text', rows: 2}),
    defineField({name: 'body', type: 'text', rows: 20, description: 'Markdown.'}),
    defineField({name: 'relatedActions', type: 'array', of: [{type: 'reference', to: [{type: 'action'}]}]}),
    defineField({name: 'relatedConcepts', type: 'array', of: [{type: 'reference', to: [{type: 'concept'}]}]}),
  ],
  preview: {select: {title: 'title', subtitle: 'audience'}},
})
