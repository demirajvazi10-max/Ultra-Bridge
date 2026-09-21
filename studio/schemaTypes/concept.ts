import {defineArrayMember, defineField, defineType} from 'sanity'

export const concept = defineType({
  name: 'concept',
  title: 'Concept',
  type: 'document',
  description: 'An idea or feature and the different names each screen reader uses for it.',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: (r) => r.required()}),
    defineField({name: 'definition', type: 'text', rows: 4}),
    defineField({
      name: 'terms',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'term',
          fields: [
            defineField({name: 'screenReader', type: 'reference', to: [{type: 'screenReader'}]}),
            defineField({name: 'term', type: 'string'}),
            defineField({name: 'note', type: 'text', rows: 2}),
          ],
          preview: {select: {title: 'term', subtitle: 'screenReader.name'}},
        }),
      ],
    }),
    defineField({
      name: 'relatedActions',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'action'}]}],
    }),
    defineField({name: 'sources', type: 'array', of: [{type: 'reference', to: [{type: 'source'}]}]}),
  ],
  preview: {select: {title: 'title'}},
})
