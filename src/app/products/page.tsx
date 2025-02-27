 // src/app/products/page.tsx
'use client';

import { sanityClient } from '@/sanity/lib/client';
import { useEffect, useState } from 'react';

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
          <div key={product._id} className="border p-4 rounded-lg">
            <img
              src={product.image?.asset?.url}
              alt={product.title}
              className="w-full h-40 object-cover mb-2"
            />
            <h2 className="text-lg font-semibold">{product.title}</h2>
            <p className="text-gray-700">${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}