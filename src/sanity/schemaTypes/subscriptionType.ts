// src/sanity/schemaTypes/subscriptionType.ts
import {CreditCardIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const subscriptionType = defineType({
  name: 'subscription',
  title: 'Subscription',
  type: 'document',
  icon: CreditCardIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
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
      title: 'Description',
      type: 'text',
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
      title: 'Features',
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
      description: 'List of features included in this subscription',
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
      name: 'appointmentAccess',
      title: 'Appointment Access',
      type: 'boolean',
      description: 'Whether this subscription grants access to book appointments',
      initialValue: true,
    }),
    defineField({
      name: 'appointmentDiscountPercentage',
      title: 'Appointment Discount Percentage',
      type: 'number',
      description: 'Percentage discount on appointments for subscribers (0-100)',
      validation: (Rule) => Rule.min(0).max(100),
      initialValue: 0,
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
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
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