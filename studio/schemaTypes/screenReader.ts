import {defineField, defineType} from 'sanity'

export const screenReader = defineType({
  name: 'screenReader',
  title: 'Screen reader',
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'name'}, validation: (r) => r.required()}),
    defineField({name: 'vendor', type: 'string'}),
    defineField({name: 'licence', type: 'string'}),
    defineField({
      name: 'modifierKeys',
      title: 'Modifier keys',
      type: 'text',
      rows: 2,
      description: 'Which key acts as the screen reader key in each layout.',
    }),
    defineField({name: 'homepage', type: 'url'}),
  ],
  preview: {select: {title: 'name', subtitle: 'vendor'}},
})
