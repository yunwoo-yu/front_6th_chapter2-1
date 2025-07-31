import { useState } from 'react';

import { useProducts } from '@/hooks/useProducts';
import { useSaleEvents } from '@/hooks/useSaleEvents';
import { Product } from '@/lib/products';
import { isProductOutOfStock } from '@/utils/stockUtils';

export const useCart = () => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [lastSelectedProductId, setLastSelectedProductId] = useState<string | null>(null);
  const { products, updateProduct, getProduct } = useProducts();

  // 세일 이벤트 시작
  useSaleEvents({ products, updateProduct, lastSelectedProductId });

  const handleAddToCartProduct = (productId: string) => {
    const product = getProduct(productId);

    if (!product) return;

    if (isProductOutOfStock(product, selectedProducts)) return;

    setSelectedProducts((prevProducts) => {
      const existingProduct = prevProducts.find((item) => item.id === productId);

      return existingProduct
        ? prevProducts.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item))
        : [...prevProducts, { ...product, quantity: 1 }];
    });

    setLastSelectedProductId(productId);
  };

  const handleQuantityChange = (productId: string, change: number) => {
    const product = getProduct(productId);

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
    products,
    handleAddToCartProduct,
    handleQuantityChange,
    handleRemoveItem,
  };
};
