import { useState } from 'react';

import { Product, PRODUCTS } from '@/lib/products';

import { isProductOutOfStock } from '../utils/stockUtils';

export const useCart = () => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const handleAddToCartProduct = (productId: string) => {
    const product = PRODUCTS.find((item) => item.id === productId);
    if (!product) return;

    if (isProductOutOfStock(product, selectedProducts)) return;

    setSelectedProducts((prevProducts) => {
      const existingProduct = prevProducts.find((item) => item.id === productId);

      return existingProduct
        ? prevProducts.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item))
        : [...prevProducts, { ...product, quantity: 1 }];
    });
  };

  const handleQuantityChange = (productId: string, change: number) => {
    const product = PRODUCTS.find((item) => item.id === productId);
    if (!product) return;

    setSelectedProducts((prevProducts) => {
      return prevProducts
        .map((item) => {
          if (item.id === productId) {
            const newQuantity = Math.max(0, Math.min(product.quantity, item.quantity + change));
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedProducts((prevProducts) => prevProducts.filter((item) => item.id !== productId));
  };

  return {
    selectedProducts,
    handleAddToCartProduct,
    handleQuantityChange,
    handleRemoveItem,
  };
};
