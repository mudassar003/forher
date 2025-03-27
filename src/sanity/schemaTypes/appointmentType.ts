// src/sanity/schemaTypes/appointmentType.ts
import {CalendarIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const appointmentType = defineType({
  name: 'appointment',
  title: 'Appointment',
  type: 'document',
  icon: CalendarIcon,
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
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'duration',
      title: 'Duration (minutes)',
      type: 'number',
      description: 'Optional: Typical duration of this appointment type',
      validation: (Rule) => Rule.positive().integer(),
    }),
    defineField({
      name: 'requiresSubscription',
      title: 'Requires Subscription',
      description: 'Check this box if user needs an active subscription to purchase this appointment',
      type: 'boolean',
      initialValue: false,
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
      name: 'qualiphyExamId',
      title: 'Qualiphy Exam ID',
      type: 'number',
      description: 'The ID of the corresponding exam in Qualiphy',
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Whether this appointment is currently available for purchase',
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
  ],
  preview: {
    select: {
      title: 'title',
      duration: 'duration',
      media: 'image',
      price: 'price',
      requiresSubscription: 'requiresSubscription',
    },
    prepare({title, duration, media, price, requiresSubscription}) {
      return {
        title,
        subtitle: `$${price}${duration ? ` / ${duration} min` : ''} ${requiresSubscription ? '(Subscription Required)' : ''}`,
        media,
      }
    },
  },
})