import { useState } from 'react';

import { Product } from '@/lib/products';
import { getDisplayPrice, getSaleIcon } from '@/utils/priceUtils';
import { createStockStatusMessage, getRemainingStock, isProductOutOfStock } from '@/utils/stockUtils';

interface ProductPickerProps {
  selectedProducts: Product[];
  products: Product[];
  handleAddToCartProduct: (productId: string) => void;
}

const LOW_STOCK_THRESHOLD = 5;

const ProductPicker = ({ selectedProducts, products, handleAddToCartProduct }: ProductPickerProps) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');

  const getStockStatusMessages = () => {
    const messages = products
      .map((product) => {
        const remainingStock = getRemainingStock(product, selectedProducts);

        if (remainingStock === 0 || remainingStock <= LOW_STOCK_THRESHOLD) {
          return createStockStatusMessage(product, remainingStock);
        }

        return null;
      })
      .filter(Boolean);

    return messages.join('\n');
  };

  return (
    <div className="mb-6 pb-6 border-b border-gray-200">
      <select
        id="product-select"
        className="w-full p-3 border border-gray-300 rounded-lg text-base mb-3"
        value={selectedProductId}
        onChange={(e) => setSelectedProductId(e.target.value)}
      >
        {products.map((product) => (
          <option key={product.id} value={product.id} disabled={isProductOutOfStock(product, selectedProducts)}>
            {getSaleIcon(product)}
            {product.name} - {getDisplayPrice(product).toLocaleString()}원
            {isProductOutOfStock(product, selectedProducts) ? ' (품절)' : ''}
          </option>
        ))}
      </select>
      <button
        className="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all"
        onClick={() => handleAddToCartProduct(selectedProductId)}
      >
        Add to Cart
      </button>
      <div id="stock-status" className="text-xs text-red-500 mt-3 whitespace-pre-line">
        {getStockStatusMessages()}
      </div>
    </div>
  );
};

export default ProductPicker;
