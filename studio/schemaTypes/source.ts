import {defineField, defineType} from 'sanity'

export const source = defineType({
  name: 'source',
  title: 'Source',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'publisher', type: 'string'}),
    defineField({
      name: 'firstParty',
      title: 'First party',
      type: 'boolean',
      description: 'True when the publisher is the maker of the screen reader.',
      initialValue: false,
    }),
    defineField({name: 'url', type: 'url', validation: (r) => r.required()}),
  ],
  preview: {select: {title: 'title', subtitle: 'publisher'}},
})
