// src/app/products/page.tsx
'use client';

import { sanityClient } from '@/sanity/lib/client';
import { useEffect, useState } from 'react';
import Image from 'next/image'; // Add this import

interface Product {
  _id: string;
  title: string;
  price: number;
  image: { asset: { url: string } };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      const query = `*[_type == "product"]{
        _id, 
        title, 
        price, 
        image{asset->{url}}
      }`;
      const data = await sanityClient.fetch(query);
      setProducts(data);
    }
    fetchProducts();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <div className="grid grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product._id} className="border p-4 rounded-lg relative group">
            <div className="relative h-40 w-full mb-2">
              <Image
                src={product.image?.asset?.url}
                alt={product.title || 'Product image'}
                fill
                className="object-cover rounded-t-lg"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <h2 className="text-lg font-semibold">{product.title}</h2>
            <p className="text-gray-700">${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}