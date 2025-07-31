import { Product } from '@/lib/products';

export const DISCOUNT_CONFIG = {
  ITEM_RATES: {
    p1: 0.1, // 버그 없애는 키보드 - 10%
    p2: 0.15, // 생산성 폭발 마우스 - 15%
    p3: 0.2, // 거북목 탈출 모니터암 - 20%
    p5: 0.25, // 코딩할 때 듣는 Lo-Fi 스피커 - 25%
  } as Record<string, number>,
  BULK_RATE: 0.25, // 30개 이상 시 25% 할인
  THRESHOLDS: {
    ITEM_DISCOUNT: 10, // 개별 상품 할인 최소 수량
    BULK_PURCHASE: 30, // 대량구매 할인 최소 수량
  },
} as const;

/**
 * 특정 상품의 개별 할인율 조회
 */
export const getItemDiscountRate = (productId: string): number => {
  return DISCOUNT_CONFIG.ITEM_RATES[productId] || 0;
};

/**
 * 상품이 개별 할인 대상인지 확인
 */
export const hasItemDiscount = (productId: string, quantity: number): boolean => {
  return quantity >= DISCOUNT_CONFIG.THRESHOLDS.ITEM_DISCOUNT && getItemDiscountRate(productId) > 0;
};

/**
 * 전체 수량이 대량구매 할인 대상인지 확인
 */
export const hasBulkDiscount = (totalQuantity: number): boolean => {
  return totalQuantity >= DISCOUNT_CONFIG.THRESHOLDS.BULK_PURCHASE;
};

/**
 * 개별 할인 적용된 가격 계산
 */
export const applyItemDiscount = (originalPrice: number, productId: string, quantity: number): number => {
  if (!hasItemDiscount(productId, quantity)) {
    return originalPrice;
  }

  const discountRate = getItemDiscountRate(productId);

  return Math.round(originalPrice * (1 - discountRate));
};

/**
 * 대량구매 할인 적용된 가격 계산
 */
export const applyBulkDiscount = (price: number): number => {
  return Math.round(price * (1 - DISCOUNT_CONFIG.BULK_RATE));
};

/**
 * 상품의 최종 할인 가격 계산 (개별 할인 → 대량구매 할인 순서)
 */
export const calculateDiscountedPrice = (product: Product, selectedProducts: Product[]): number => {
  const productInCart = selectedProducts.find((item) => item.id === product.id);
  const quantity = productInCart?.quantity || 0;
  const totalQuantity = selectedProducts.reduce((sum, item) => sum + item.quantity, 0);

  // 1단계: 개별 상품 할인 적용
  let discountedPrice = applyItemDiscount(product.discountPrice, product.id, quantity);

  // 2단계: 대량구매 할인 적용
  if (hasBulkDiscount(totalQuantity)) {
    discountedPrice = applyBulkDiscount(discountedPrice);
  }

  return discountedPrice;
};

/**
 * 전체 할인 정보 계산
 */
export const calculateDiscountSummary = (selectedProducts: Product[]) => {
  const totalQuantity = selectedProducts.reduce((sum, product) => sum + product.quantity, 0);
  const isBulkDiscountActive = hasBulkDiscount(totalQuantity);
  const originalTotal = selectedProducts.reduce((sum, product) => sum + product.discountPrice * product.quantity, 0);
  let discountedTotal: number;
  let itemDiscounts: Array<{ productId: string; productName: string; discountRate: number; quantity: number }> = [];

  if (isBulkDiscountActive) {
    // 대량구매 할인이 활성화되면 개별 할인 무시하고 전체에 25% 할인
    discountedTotal = applyBulkDiscount(originalTotal);
  } else {
    // 개별 상품 할인만 적용
    itemDiscounts = selectedProducts
      .filter((product) => hasItemDiscount(product.id, product.quantity))
      .map((product) => ({
        productId: product.id,
        productName: product.name,
        discountRate: getItemDiscountRate(product.id),
        quantity: product.quantity,
      }));

    discountedTotal = selectedProducts.reduce((sum, product) => {
      const quantity = product.quantity;
      if (hasItemDiscount(product.id, quantity)) {
        return sum + applyItemDiscount(product.discountPrice, product.id, quantity) * quantity;
      }
      return sum + product.discountPrice * quantity;
    }, 0);
  }

  const totalSavings = originalTotal - discountedTotal;
  const totalDiscountRate = originalTotal > 0 ? totalSavings / originalTotal : 0;

  return {
    totalQuantity,
    originalTotal,
    discountedTotal,
    totalSavings,
    totalDiscountRate,
    isBulkDiscountActive,
    bulkDiscountRate: isBulkDiscountActive ? DISCOUNT_CONFIG.BULK_RATE : 0,
    itemDiscounts,
  };
};
