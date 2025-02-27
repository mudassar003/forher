// src/sanity/structure.ts
import { StructureResolver } from 'sanity/desk';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('E-commerce Dashboard')
    .items([
      // Automatically include all document types
      ...S.documentTypeListItems(),

      // Custom groupings for better organization
      S.divider(),
      S.listItem()
        .title('Product Management')
        .child(
          S.list()
            .title('Product Data')
            .items([
              S.listItem()
                .title('Products')
                .schemaType('product')
                .child(S.documentTypeList('product').title('Products')),
              S.listItem()
                .title('Categories')
                .schemaType('category')
                .child(S.documentTypeList('category').title('Categories')),
              S.listItem()
                .title('Variants')
                .schemaType('variant')
                .child(S.documentTypeList('variant').title('Product Variants')),
            ])
        ),

      S.divider(),
      S.listItem()
        .title('Orders & Sales')
        .child(
          S.list()
            .title('Sales Data')
            .items([
              S.listItem()
                .title('Orders')
                .schemaType('order')
                .child(S.documentTypeList('order').title('Orders')),
            ])
        ),

      S.divider(),
      S.documentTypeListItem().title('All Documents'),
    ]);
