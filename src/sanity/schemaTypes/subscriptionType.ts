//src/sanity/schemaTypes/subscriptionType.ts
import { CreditCardIcon } from '@sanity/icons'
import {defineField, defineType, defineArrayMember} from 'sanity'

// Define the document context type for validation
interface SubscriptionDocument {
  hasVariants?: boolean;
  billingPeriod?: string;
  customBillingPeriodMonths?: number;
}

// Define the parent context type for variants
interface VariantParent {
  billingPeriod?: string;
  customBillingPeriodMonths?: number;
}

// Define the validation context type
interface ValidationContext {
  document?: SubscriptionDocument;
  parent?: VariantParent;
}

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
      type: 'array', 
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
      type: 'array',
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
    // Variants for different dosages and pricing options
    defineField({
      name: 'hasVariants',
      title: 'Has Variants',
      type: 'boolean',
      description: 'Enable if this subscription has multiple variants (e.g., different dosages)',
      initialValue: false,
    }),
    defineField({
      name: 'variants',
      title: 'Subscription Variants',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'variant',
          title: 'Variant',
          fields: [
            {
              name: 'title',
              title: 'Variant Title (English)',
              type: 'string',
              description: 'E.g., "Standard Dosage", "High Dosage", etc.',
              validation: (Rule) => Rule.required()
            },
            {
              name: 'titleEs',
              title: 'Variant Title (Spanish)',
              type: 'string',
              description: 'Spanish translation of the variant title',
            },
            {
              name: 'description',
              title: 'Variant Description (English)',
              type: 'text',
              description: 'Brief description of this variant (e.g., "3 month supply with 1 dosage per month")',
            },
            {
              name: 'descriptionEs',
              title: 'Variant Description (Spanish)',
              type: 'text',
              description: 'Spanish translation of the variant description',
            },
            {
              name: 'dosageAmount',
              title: 'Dosage Amount',
              type: 'number',
              description: 'The amount of product included (e.g., number of doses)',
              validation: (Rule) => Rule.required().positive()
            },
            {
              name: 'dosageUnit',
              title: 'Dosage Unit',
              type: 'string',
              description: 'The unit of measurement (e.g., "tablets", "bottles")',
              validation: (Rule) => Rule.required()
            },
            {
              name: 'price',
              title: 'Variant Price',
              type: 'number',
              description: 'The price for this specific variant',
              validation: (Rule) => Rule.required().positive()
            },
            {
              name: 'compareAtPrice',
              title: 'Compare At Price',
              type: 'number',
              description: 'Original price to show a discount (if applicable)',
            },
            {
              name: 'billingPeriod',
              title: 'Billing Period',
              type: 'string',
              options: {
                list: [
                  {title: '1 Month', value: 'monthly'},
                  {title: '3 Months', value: 'three_month'},
                  {title: '6 Months', value: 'six_month'},
                  {title: '1 Year', value: 'annually'},
                  {title: 'Other', value: 'other'}
                ],
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'customBillingPeriodMonths',
              title: 'Custom Billing Period (in months)',
              type: 'number',
              description: 'If billing period is set to "Other", specify the number of months here',
              validation: (Rule) => 
                Rule.custom((currentValue, context) => {
                  const typedContext = context as ValidationContext;
                  const billingPeriod = typedContext.parent?.billingPeriod;
                  if (billingPeriod === 'other' && !currentValue) {
                    return 'Required when billing period is set to "Other"';
                  }
                  return true;
                })
            },
            {
              name: 'stripePriceId',
              title: 'Stripe Price ID',
              type: 'string',
              description: 'The ID of the corresponding price in Stripe for this variant',
            },
            {
              name: 'isDefault',
              title: 'Default Variant',
              type: 'boolean',
              description: 'Set as the default selected variant',
              initialValue: false,
            },
            {
              name: 'isPopular',
              title: 'Popular Choice',
              type: 'boolean',
              description: 'Mark this variant as the popular choice',
              initialValue: false,
            },
          ],
          preview: {
            select: {
              title: 'title',
              dosage: 'dosageAmount',
              unit: 'dosageUnit',
              price: 'price',
              period: 'billingPeriod',
              isDefault: 'isDefault',
              isPopular: 'isPopular'
            },
            prepare({ title, dosage, unit, price, period, isDefault, isPopular }) {
              let subtitle = '';
              
              if (dosage && unit) {
                subtitle += `${dosage} ${unit} · `;
              }
              
              subtitle += `$${price} / `;
              
              switch (period) {
                case 'monthly': subtitle += 'month'; break;
                case 'three_month': subtitle += '3 months'; break;
                case 'six_month': subtitle += '6 months'; break;
                case 'annually': subtitle += 'year'; break;
                case 'other': subtitle += 'custom period'; break;
                default: subtitle += period || 'month';
              }
              
              let badgeText = '';
              if (isDefault) badgeText += '✓ Default ';
              if (isPopular) badgeText += '🔥 Popular ';
              
              return {
                title: title || 'Untitled Variant',
                subtitle: subtitle,
                media: CreditCardIcon,
                description: badgeText
              };
            }
          }
        }
      ],
      description: 'Different variants of this subscription (dosages, pricing options)',
      validation: (Rule) => Rule.custom((variants, context) => {
        const typedContext = context as ValidationContext;
        const hasVariants = typedContext.document?.hasVariants;
        
        if (hasVariants && (!variants || variants.length === 0)) {
          return 'At least one variant is required when "Has Variants" is enabled';
        }
        
        // Check that only one variant is marked as default
        if (variants && variants.length > 0) {
          const defaultVariants = variants.filter((v: any) => v.isDefault);
          if (defaultVariants.length > 1) {
            return 'Only one variant can be marked as default';
          }
        }
        
        return true;
      })
    }),
    // Default pricing for non-variant plans
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      description: 'The price for this subscription (if no variants)',
      validation: (Rule) => Rule.custom((price, context) => {
        const typedContext = context as ValidationContext;
        const hasVariants = typedContext.document?.hasVariants;
        
        if (!hasVariants && (price === undefined || price === null)) {
          return 'Price is required when variants are not used';
        }
        
        return true;
      })
    }),
    defineField({
      name: 'compareAtPrice',
      title: 'Compare At Price',
      type: 'number',
      description: 'Original price to show a discount (if applicable)',
    }),
    defineField({
      name: 'billingPeriod',
      title: 'Billing Period',
      type: 'string',
      description: 'The billing period (if no variants)',
      options: {
        list: [
          {title: '1 Month', value: 'monthly'},
          {title: '3 Months', value: 'three_month'},
          {title: '6 Months', value: 'six_month'},
          {title: '1 Year', value: 'annually'},
          {title: 'Other', value: 'other'}
        ],
      },
      validation: (Rule) => Rule.custom((billingPeriod, context) => {
        const typedContext = context as ValidationContext;
        const hasVariants = typedContext.document?.hasVariants;
        
        if (!hasVariants && !billingPeriod) {
          return 'Billing period is required when variants are not used';
        }
        
        return true;
      })
    }),
    defineField({
      name: 'customBillingPeriodMonths',
      title: 'Custom Billing Period (in months)',
      type: 'number',
      description: 'If billing period is set to "Other", specify the number of months here',
      validation: (Rule) => 
        Rule.custom((currentValue, context) => {
          const typedContext = context as ValidationContext;
          const hasVariants = typedContext.document?.hasVariants;
          const billingPeriod = typedContext.document?.billingPeriod;
          
          if (!hasVariants && billingPeriod === 'other' && !currentValue) {
            return 'Required when billing period is set to "Other"';
          }
          return true;
        })
    }),
    defineField({
      name: 'stripePriceId',
      title: 'Stripe Price ID',
      type: 'string',
      description: 'The ID of the corresponding price in Stripe (if no variants)',
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
    // Field for featured image specifically for catalog/grid display
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
      customPeriod: 'customBillingPeriodMonths',
      hasVariants: 'hasVariants',
      variants: 'variants'
    },
    prepare({title, subtitle, media, price, isDeleted, isFeatured, customPeriod, hasVariants, variants}) {
      let displayPeriod = subtitle;
      let displayPrice = price;
      
      // If has variants, show variant count instead of price/period
      if (hasVariants && variants && variants.length > 0) {
        const variantCount = variants.length;
        return {
          title: `${isDeleted ? `${title} (Deleted)` : title}${isFeatured ? ' ⭐' : ''}`,
          subtitle: `${variantCount} variant${variantCount > 1 ? 's' : ''}`,
          media,
        };
      }
      
      // Format the subtitle based on billing period for non-variant subscriptions
      if (subtitle === 'monthly') displayPeriod = 'monthly';
      else if (subtitle === 'three_month') displayPeriod = '3 months';
      else if (subtitle === 'six_month') displayPeriod = '6 months';
      else if (subtitle === 'annually') displayPeriod = 'annual';
      else if (subtitle === 'other' && customPeriod) displayPeriod = `${customPeriod} months`;
      
      return {
        title: `${isDeleted ? `${title} (Deleted)` : title}${isFeatured ? ' ⭐' : ''}`,
        subtitle: `$${displayPrice} / ${displayPeriod}`,
        media,
      }
    },
  },
});