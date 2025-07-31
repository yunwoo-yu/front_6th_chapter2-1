import { useState } from 'react';

import { Product } from '@/lib/products';
import { createStockStatusMessage, getRemainingStock, isProductOutOfStock } from '@/utils/stockUtils';

interface ProductPickerProps {
  selectedProducts: Product[];
  products: Product[];
  handleAddToCartProduct: (productId: string) => void;
}

const LOW_STOCK_THRESHOLD = 5;

const getProductOptionText = (product: Product, isOutOfStock: boolean): string => {
  if (isOutOfStock) {
    const saleText = buildSaleText(product);
    return `${product.name} - ${product.discountPrice.toLocaleString()}원 (품절)${saleText}`;
  }

  const displayInfo = buildProductDisplayInfo(product);
  return displayInfo.text;
};

const getProductOptionClassName = (product: Product, isOutOfStock: boolean): string => {
  if (isOutOfStock) {
    return 'text-gray-400';
  }

  const displayInfo = buildProductDisplayInfo(product);
  return displayInfo.className;
};

const buildSaleText = (product: Product): string => {
  const saleLabels = [];

  if (product.onSale) saleLabels.push(' ⚡SALE');
  if (product.suggestSale) saleLabels.push(' 💝추천');

  return saleLabels.join('');
};

const buildProductDisplayInfo = (product: Product) => {
  const { name, discountPrice, price, onSale, suggestSale } = product;

  // 세일 조합별 표시 정보 매핑 (베이직과 동일)
  const saleDisplayMap = {
    both: {
      text: `⚡💝${name} - ${price.toLocaleString()}원 → ${discountPrice.toLocaleString()}원 (25% SUPER SALE!)`,
      className: 'text-purple-600 font-bold',
    },
    lightning: {
      text: `⚡${name} - ${price.toLocaleString()}원 → ${discountPrice.toLocaleString()}원 (20% SALE!)`,
      className: 'text-red-500 font-bold',
    },
    suggest: {
      text: `💝${name} - ${price.toLocaleString()}원 → ${discountPrice.toLocaleString()}원 (5% 추천할인!)`,
      className: 'text-blue-500 font-bold',
    },
    none: {
      text: `${name} - ${discountPrice.toLocaleString()}원${buildSaleText(product)}`,
      className: '',
    },
  };

  if (onSale && suggestSale) return saleDisplayMap.both;
  if (onSale) return saleDisplayMap.lightning;
  if (suggestSale) return saleDisplayMap.suggest;
  return saleDisplayMap.none;
};

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
        {products.map((product) => {
          const isOutOfStock = isProductOutOfStock(product, selectedProducts);
          const optionText = getProductOptionText(product, isOutOfStock);
          const optionClassName = getProductOptionClassName(product, isOutOfStock);

          return (
            <option key={product.id} value={product.id} disabled={isOutOfStock} className={optionClassName}>
              {optionText}
            </option>
          );
        })}
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
