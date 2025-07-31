import { Product } from '@/lib/products';

export const getPriceDisplay = (product: Product) => {
  if (product.onSale || product.suggestSale) {
    const colorClass =
      product.onSale && product.suggestSale ? 'text-purple-600' : product.onSale ? 'text-red-500' : 'text-blue-500';

    return (
      <>
        <span className="line-through text-gray-400">₩{product.price.toLocaleString()}</span>{' '}
        <span className={colorClass}>₩{product.discountPrice.toLocaleString()}</span>
      </>
    );
  }
  return `₩${product.discountPrice.toLocaleString()}`;
};

export const getSaleIcon = (product: Product): string => {
  if (product.onSale && product.suggestSale) return '⚡💝';
  if (product.onSale) return '⚡';
  if (product.suggestSale) return '💝';
  return '';
};

export const getDisplayPrice = (product: Product): number => {
  return product.onSale || product.suggestSale ? product.discountPrice : product.price;
};
