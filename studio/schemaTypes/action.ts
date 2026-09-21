import {defineField, defineType} from 'sanity'

export const CATEGORIES = [
  'reading',
  'speech',
  'browse-navigation',
  'element-lists',
  'forms-and-modes',
  'tables',
  'search',
  'system',
]

export const action = defineType({
  name: 'action',
  title: 'Action',
  type: 'document',
  description:
    'A task a user wants to perform, independent of the screen reader. Commands in each screen reader point to an action, so equivalents are found through the action.',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: (r) => r.required()}),
    defineField({
      name: 'category',
      type: 'string',
      options: {list: CATEGORIES},
      validation: (r) => r.required(),
    }),
    defineField({name: 'description', type: 'text', rows: 3}),
    defineField({
      name: 'phrases',
      title: 'How people ask for it',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Everyday wording that should lead to this action.',
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'category'}},
})
