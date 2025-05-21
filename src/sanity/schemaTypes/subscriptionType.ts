//src/sanity/schemaTypes/subscriptionType.ts
import { CreditCardIcon } from '@sanity/icons'
import {defineField, defineType, defineArrayMember} from 'sanity'

export const subscriptionType = defineType({
  name: 'subscription',
  title: 'Subscription',
  type: 'document',
  icon: CreditCardIcon,
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
      description: 'Spanish translation of the subscription title',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description (English)',
      type: 'array', // Changed from 'text' to array of blocks
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'Quote', value: 'blockquote'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'}
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url',
                  },
                ],
              },
            ],
          },
        }),
      ],
      description: 'Rich text description for this subscription plan (English)',
    }),
    defineField({
      name: 'descriptionEs',
      title: 'Description (Spanish)',
      type: 'array', // Changed from 'text' to array of blocks
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'Quote', value: 'blockquote'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'}
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url',
                  },
                ],
              },
            ],
          },
        }),
      ],
      description: 'Rich text description for this subscription plan (Spanish)',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'subscriptionCategory'}],
        },
      ],
    }),
    defineField({
      name: 'features',
      title: 'Features (English)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'feature',
          fields: [
            {
              name: 'featureText',
              title: 'Feature',
              type: 'string'
            }
          ],
          preview: {
            select: {
              title: 'featureText'
            }
          }
        }
      ],
      description: 'List of features included in this subscription (English)',
    }),
    defineField({
      name: 'featuresEs',
      title: 'Features (Spanish)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'feature',
          fields: [
            {
              name: 'featureText',
              title: 'Feature',
              type: 'string'
            }
          ],
          preview: {
            select: {
              title: 'featureText'
            }
          }
        }
      ],
      description: 'List of features included in this subscription (Spanish)',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'billingPeriod',
      title: 'Billing Period',
      type: 'string',
      options: {
        list: [
          {title: 'Monthly', value: 'monthly'},
          {title: 'Quarterly', value: 'quarterly'},
          {title: 'Annually', value: 'annually'}
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'stripePriceId',
      title: 'Stripe Price ID',
      type: 'string',
      description: 'The ID of the corresponding price in Stripe',
    }),
    defineField({
      name: 'stripeProductId',
      title: 'Stripe Product ID',
      type: 'string',
      description: 'The ID of the corresponding product in Stripe',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Subscription',
      type: 'boolean',
      description: 'Whether to show this subscription in the featured section',
      initialValue: false,
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Whether this subscription is currently available for purchase',
      initialValue: true,
    }),
    // Standard main image field
    defineField({
      name: 'image',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'The main product image used on detail pages and throughout the site'
    }),
    // New field for featured image specifically for catalog/grid display
    defineField({
      name: 'featuredImage',
      title: 'Featured Catalog Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Optimized image for display in subscription catalog cards (if different from main image)'
    }),
    defineField({
      name: 'isDeleted',
      title: 'Deleted',
      type: 'boolean',
      description: 'Soft deletion flag',
      initialValue: false,
      hidden: true, // Hide in the UI by default
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'billingPeriod',
      media: 'image',
      price: 'price',
      isDeleted: 'isDeleted',
      isFeatured: 'isFeatured',
    },
    prepare({title, subtitle, media, price, isDeleted, isFeatured}) {
      return {
        title: `${isDeleted ? `${title} (Deleted)` : title}${isFeatured ? ' ⭐' : ''}`,
        subtitle: `$${price} / ${subtitle}`,
        media,
      }
    },
  },
})