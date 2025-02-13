'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Define a TypeScript interface for Product
interface Product {
  id: number;
  name: string;
  price: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('products').select('*');

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        setProducts(data as Product[]); // Ensure TypeScript recognizes the data type
      }
    }

    fetchProducts();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Products</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>{product.name} - ${product.price}</li>
        ))}
      </ul>
    </div>
  );
}
