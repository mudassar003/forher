// src/sanity/structure.ts
import { StructureResolver } from 'sanity/structure';
import S from '@sanity/desk-tool/structure-builder'; // ✅ Correct import

export const structure: StructureResolver = () =>
  S.list()
    .title('E-commerce Dashboard')
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
      S.divider(),
      S.listItem()
        .title('Orders')
        .schemaType('order')
        .child(S.documentTypeList('order').title('Orders')),
      S.divider(),
      S.documentTypeListItem().title('All Documents'),
    ]);
