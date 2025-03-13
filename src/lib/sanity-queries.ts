// src/lib/sanity-queries.ts
import { client } from '@/sanity/lib/client';

export async function getWeightLossProducts() {
  const query = `*[_type == "product" && "weight-loss" in categories[]->slug.current] {
    _id,
    title,
    slug,
    price,
    description,
    mainImage,
    isOnSale,
    compareAtPrice
  }`;
  
  return client.fetch(query);
}