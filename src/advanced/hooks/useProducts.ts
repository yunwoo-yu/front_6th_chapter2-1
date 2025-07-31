import { useCallback, useState } from 'react';

import { Product, PRODUCTS } from '@/lib/products';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);

  const updateProduct = useCallback((productId: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((product) => (product.id === productId ? { ...product, ...updates } : product)));
  }, []);

  const getProduct = useCallback(
    (productId: string) => {
      return products.find((product) => product.id === productId);
    },
    [products]
  );

  return {
    products,
    updateProduct,
    getProduct,
  };
};
