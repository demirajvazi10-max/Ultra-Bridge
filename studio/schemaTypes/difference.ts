import {defineField, defineType} from 'sanity'

export const difference = defineType({
  name: 'difference',
  title: 'Difference',
  type: 'document',
  description: 'Something that trips people up when moving between screen readers.',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: (r) => r.required()}),
    defineField({
      name: 'severity',
      type: 'string',
      options: {list: ['high', 'medium', 'low']},
      validation: (r) => r.required(),
    }),
    defineField({name: 'summary', type: 'text', rows: 4}),
    defineField({name: 'workaround', type: 'text', rows: 3}),
    defineField({
      name: 'readers',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'screenReader'}]}],
    }),
    defineField({
      name: 'affectedActions',
      title: 'Affected actions',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'action'}]}],
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'severity'}},
})
