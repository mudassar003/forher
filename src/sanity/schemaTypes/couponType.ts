// src/sanity/schemaTypes/couponType.ts
import { TagIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const couponType = defineType({
  name: 'coupon',
  title: 'Coupon',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'code',
      title: 'Coupon Code',
      type: 'string',
      description: 'Unique coupon code (e.g., SAVE20, WELCOME10)',
      validation: (Rule) => Rule.required().uppercase().regex(/^[A-Z0-9]+$/, {
        name: 'alphanumeric',
        invert: false
      }).error('Code must be uppercase alphanumeric only'),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'string',
      description: 'Internal description of the coupon',
    }),
    defineField({
      name: 'discountType',
      title: 'Discount Type',
      type: 'string',
      options: {
        list: [
          { title: 'Percentage', value: 'percentage' },
          { title: 'Fixed Amount', value: 'fixed' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'discountValue',
      title: 'Discount Value',
      type: 'number',
      description: 'For percentage: 0-100, for fixed: dollar amount',
      validation: (Rule) => Rule.required().positive().custom((value, context) => {
        const discountType = (context.document as any)?.discountType;
        if (discountType === 'percentage' && value && value > 100) {
          return 'Percentage discount cannot exceed 100%';
        }
        return true;
      }),
    }),
    defineField({
      name: 'subscriptions',
      title: 'Applicable Subscriptions',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'subscription' }],
        },
      ],
      description: 'Leave empty to apply to all subscriptions',
    }),
    defineField({
      name: 'usageLimit',
      title: 'Usage Limit',
      type: 'number',
      description: 'Maximum number of times this coupon can be used (leave empty for unlimited)',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'usageCount',
      title: 'Current Usage Count',
      type: 'number',
      description: 'Number of times this coupon has been used',
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: 'validFrom',
      title: 'Valid From',
      type: 'datetime',
      description: 'When the coupon becomes active',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'validUntil',
      title: 'Valid Until',
      type: 'datetime',
      description: 'When the coupon expires',
      validation: (Rule) => Rule.required().custom((validUntil, context) => {
        const validFrom = (context.document as any)?.validFrom;
        if (validFrom && validUntil && new Date(validUntil) <= new Date(validFrom)) {
          return 'Expiry date must be after the start date';
        }
        return true;
      }),
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Whether this coupon is currently active',
      initialValue: true,
    }),
    defineField({
      name: 'minimumPurchaseAmount',
      title: 'Minimum Purchase Amount',
      type: 'number',
      description: 'Minimum subscription price required to use this coupon (optional)',
      validation: (Rule) => Rule.min(0),
    }),
  ],
  preview: {
    select: {
      code: 'code',
      description: 'description',
      discountType: 'discountType',
      discountValue: 'discountValue',
      isActive: 'isActive',
      usageCount: 'usageCount',
      usageLimit: 'usageLimit',
    },
    prepare({ code, description, discountType, discountValue, isActive, usageCount, usageLimit }) {
      const discountText = discountType === 'percentage' 
        ? `${discountValue}% off` 
        : `$${discountValue} off`;
      
      const usageText = usageLimit 
        ? `Used ${usageCount || 0}/${usageLimit}` 
        : `Used ${usageCount || 0} times`;
      
      return {
        title: `${code}${!isActive ? ' (Inactive)' : ''}`,
        subtitle: `${discountText} • ${usageText}`,
        media: TagIcon,
      };
    },
  },
});