import {UserIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const userSubscriptionType = defineType({
  name: 'userSubscription',
  title: 'User Subscription',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'userId',
      title: 'User ID',
      type: 'string',
      description: 'Supabase user ID',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'userEmail',
      title: 'User Email',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subscription',
      title: 'Subscription Plan',
      type: 'reference',
      to: [{type: 'subscription'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
      description: 'When the subscription period ends',
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Whether the subscription is currently active',
      initialValue: true,
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Active', value: 'active'},
          {title: 'Paused', value: 'paused'},
          {title: 'Cancelled', value: 'cancelled'},
          {title: 'Expired', value: 'expired'},
        ],
      },
      initialValue: 'active',
    }),
    defineField({
      name: 'stripeSubscriptionId',
      title: 'Stripe Subscription ID',
      type: 'string',
    }),
    defineField({
      name: 'stripeCustomerId',
      title: 'Stripe Customer ID',
      type: 'string',
    }),
    defineField({
      name: 'nextBillingDate',
      title: 'Next Billing Date',
      type: 'datetime',
    }),
    defineField({
      name: 'billingPeriod',
      title: 'Billing Period',
      type: 'string',
      options: {
        list: [
          {title: 'Monthly', value: 'monthly'},
          {title: 'Quarterly', value: 'quarterly'},
          {title: 'Annually', value: 'annually'},
        ],
      },
    }),
    defineField({
      name: 'billingAmount',
      title: 'Billing Amount',
      type: 'number',
    }),
    defineField({
      name: 'hasAppointmentAccess',
      title: 'Has Appointment Access',
      type: 'boolean',
      description: 'Whether this subscription grants access to book appointments',
      initialValue: true,
    }),
    defineField({
      name: 'appointmentDiscountPercentage',
      title: 'Appointment Discount Percentage',
      type: 'number',
      description: 'Percentage discount on appointments for this user',
      initialValue: 0,
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
      userEmail: 'userEmail',
      status: 'status',
      startDate: 'startDate',
      subscriptionTitle: 'subscription.title',
      isDeleted: 'isDeleted',
    },
    prepare({userEmail, status, startDate, subscriptionTitle, isDeleted}) {
      return {
        title: isDeleted ? `${userEmail} (Deleted)` : userEmail,
        subtitle: `${subscriptionTitle || 'Unknown plan'} | ${status || 'Unknown'} | Started: ${
          startDate ? new Date(startDate).toLocaleDateString() : 'Unknown'
        }`,
      }
    },
  },
})