// src/sanity/schemaTypes/postType.ts
import {DocumentTextIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title (English)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'titleEs',
      title: 'Title (Spanish)',
      type: 'string',
      description: 'Spanish translation of the post title',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: {type: 'author'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text (English)',
          description: 'Important for SEO and accessibility.',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'altEs',
          type: 'string',
          title: 'Alternative text (Spanish)',
          description: 'Spanish translation of the alternative text.',
        })
      ]
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: {type: 'category'}})],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt (English)',
      type: 'text',
      description: 'Short description of the post (English)',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'excerptEs',
      title: 'Excerpt (Spanish)',
      type: 'text',
      description: 'Short description of the post (Spanish)',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'body',
      title: 'Body (English)',
      type: 'blockContent',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bodyEs',
      title: 'Body (Spanish)',
      type: 'blockContent',
      description: 'Spanish translation of the post body',
    }),
    defineField({
      name: 'featured',
      title: 'Featured Post',
      type: 'boolean',
      description: 'Mark this post as featured to highlight it',
      initialValue: false,
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title (English)',
          type: 'string',
          validation: (Rule) => Rule.max(60),
        }),
        defineField({
          name: 'metaTitleEs',
          title: 'Meta Title (Spanish)',
          type: 'string',
          validation: (Rule) => Rule.max(60),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description (English)',
          type: 'text',
          validation: (Rule) => Rule.max(160),
        }),
        defineField({
          name: 'metaDescriptionEs',
          title: 'Meta Description (Spanish)',
          type: 'text',
          validation: (Rule) => Rule.max(160),
        }),
      ]
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Whether this post is currently published and visible',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
      featured: 'featured',
      isActive: 'isActive',
    },
    prepare(selection) {
      const {author, featured, isActive} = selection
      let subtitle = author && `by ${author}`
      
      if (featured) subtitle += ' • Featured'
      if (!isActive) subtitle += ' • Inactive'
      
      return {...selection, subtitle}
    },
  },
})