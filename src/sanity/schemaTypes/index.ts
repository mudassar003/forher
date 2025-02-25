// src/sanity/schemaTypes/index.ts
import { type SchemaTypeDefinition } from 'sanity';

// Import all schema types
import product from './product';
import category from './category';
import variant from './variant';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [product, category, variant],
};
