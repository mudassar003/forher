'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('products').select('*');
      if (error) console.error('Error fetching data:', error);
      else setProducts(data);
    }
    fetchProducts();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Products</h1>
      <ul>
        {products.map((product: any) => (
          <li key={product.id}>{product.name} - ${product.price}</li>
        ))}
      </ul>
    </div>
  );
}
