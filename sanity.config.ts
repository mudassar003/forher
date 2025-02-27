'use client';

/**
 * This configuration is used for the Sanity Studio that's mounted on the \src\app\studio\[[...tool]] route
 */

import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { structure } from './src/sanity/structure'; // Ensure correct import

// Import environment variables
import { apiVersion, dataset, projectId } from './src/sanity/env';

// Import schemas and custom desk structure
import { schema } from './src/sanity/schemaTypes';

export default defineConfig({
  basePath: '/studio', // URL path for embedded Sanity Studio
  projectId,
  dataset,
  title: 'E-commerce Dashboard',
  apiVersion: apiVersion,

  // Add schemas and tools
  schema: schema,
  plugins: [
    deskTool({
      structure: (S, context) => structure(S, context), // ✅ Pass as function
    }),
    visionTool({ defaultApiVersion: apiVersion }), // Optional: GROQ query testing
  ],
});
