import { Product } from '@/lib/products';

/**
 * 선택된 상품 중 특정 상품의 수량을 반환
 * @param selectedProducts 선택된 상품 배열
 * @param productId 수량을 조회할 상품 ID
 * @returns 선택된 상품 중 특정 상품의 수량
 */
export const getSelectedProductQuantity = (selectedProducts: Product[], productId: string) => {
  return selectedProducts.find((item) => item.id === productId)?.quantity || 0;
};

/**
 * 특정 상품의 재고 수량을 계산
 * @param product 재고 수량을 계산할 상품
 * @param selectedProducts 선택된 상품 배열
 * @returns 특정 상품의 재고 수량
 */
export const getRemainingStock = (product: Product, selectedProducts: Product[]) => {
  const selectedQuantity = getSelectedProductQuantity(selectedProducts, product.id);

  return product.quantity - selectedQuantity;
};

/**
 * 특정 상품이 품절 상태인지 확인
 * @param product 품절 상태를 확인할 상품
 * @param selectedProducts 선택된 상품 배열
 * @returns 특정 상품이 품절 상태인지 여부
 */
export const isProductOutOfStock = (product: Product, selectedProducts: Product[]) => {
  return getRemainingStock(product, selectedProducts) === 0;
};

/**
 * 특정 상품의 재고 상태 메시지 생성
 * @param product 메시지를 생성할 상품
 * @param remainingStock 특정 상품의 재고 수량
 * @returns 특정 상품의 재고 상태 메시지
 */
export const createStockStatusMessage = (product: Product, remainingStock: number) => {
  if (remainingStock === 0) {
    return `${product.name}: 품절`;
  }

  return `${product.name}: 재고 부족 (${remainingStock}개 남음)`;
};
