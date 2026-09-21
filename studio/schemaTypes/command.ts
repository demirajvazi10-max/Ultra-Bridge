import {defineField, defineType} from 'sanity'

export const command = defineType({
  name: 'command',
  title: 'Command',
  type: 'document',
  description: 'The keys a specific screen reader uses to perform an action.',
  fields: [
    defineField({
      name: 'label',
      type: 'string',
      description: 'Human readable summary. Also helps search find the command.',
    }),
    defineField({
      name: 'screenReader',
      title: 'Screen reader',
      type: 'reference',
      to: [{type: 'screenReader'}],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'action',
      type: 'reference',
      to: [{type: 'action'}],
      validation: (r) => r.required(),
    }),
    defineField({name: 'keys', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'layout',
      type: 'string',
      options: {list: ['desktop', 'laptop', 'both']},
      description: '"both" means the same keys work in either keyboard layout.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'context',
      type: 'string',
      options: {list: ['anywhere', 'browse-mode']},
      initialValue: 'anywhere',
    }),
    defineField({name: 'note', type: 'text', rows: 2}),
    defineField({
      name: 'verification',
      type: 'string',
      options: {list: ['cross-checked', 'first-party', 'third-party', 'recalled', 'tested-by-author']},
      description:
        'cross-checked: two or more sources agree. first-party: one document from the maker. third-party: one non-maker page. recalled: not confirmed in a source and needs a check on a real system. tested-by-author: confirmed by pressing the keys on a real system.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'sources',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'source'}]}],
    }),
  ],
  preview: {select: {title: 'label', subtitle: 'verification'}},
})
