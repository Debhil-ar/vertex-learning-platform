import { StackIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

// A module is embedded inside a course, not its own document — it has no
// existence or reuse outside the course that defines it.
export const moduleType = defineType({
  name: 'module',
  title: 'Module',
  type: 'object',
  icon: StackIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      type: 'text',
    }),
    defineField({
      name: 'lessons',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'lesson' }] })],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: 'title', lessons: 'lessons' },
    prepare({ title, lessons }) {
      const count = Array.isArray(lessons) ? lessons.length : 0
      return {
        title,
        subtitle: `${count} lesson${count === 1 ? '' : 's'}`,
      }
    },
  },
})
