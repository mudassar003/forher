// sanity/schemas/variant.ts
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'variant',
  title: 'Product Variant',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Variant Name',
      type: 'string',
    }),
    defineField({
      name: 'option',
      title: 'Option',
      type: 'string',
    }),
  ],
});
