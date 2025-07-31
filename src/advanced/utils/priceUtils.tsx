import { Product } from '@/lib/products';

/**
 * 세일 상태에 따른 가격 표시 JSX를 반환
 * 세일 중이면 취소선과 할인가를 색상과 함께 표시
 */
export const renderPriceWithDiscountStyle = (product: Product) => {
  if (product.onSale || product.suggestSale) {
    const discountColorClass = getDiscountColorClass(product);

    return (
      <>
        <span className="line-through text-gray-400">₩{product.price.toLocaleString()}</span>{' '}
        <span className={discountColorClass}>₩{product.discountPrice.toLocaleString()}</span>
      </>
    );
  }

  return `₩${product.discountPrice.toLocaleString()}`;
};

/**
 * 세일 타입에 따른 아이콘 반환
 */
export const getSaleTypeIcon = (product: Product): string => {
  if (product.onSale && product.suggestSale) return '⚡💝';

  if (product.onSale) return '⚡';

  if (product.suggestSale) return '💝';

  return '';
};

/**
 * 현재 유효한 판매 가격 반환 (세일가 우선)
 */
export const getCurrentSellingPrice = (product: Product): number => {
  return product.onSale || product.suggestSale ? product.discountPrice : product.price;
};

/**
 * 세일 타입에 따른 할인 색상 클래스 반환
 */
const getDiscountColorClass = (product: Product): string => {
  if (product.onSale && product.suggestSale) return 'text-purple-600';

  if (product.onSale) return 'text-red-500';

  if (product.suggestSale) return 'text-blue-500';

  return '';
};
