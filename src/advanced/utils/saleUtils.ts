import { Product } from '@/lib/products';

export const SALE_CONFIG = {
  LIGHTNING_SALE: {
    DISCOUNT_RATE: 0.2,
    MAX_DELAY: 10000,
    INTERVAL: 30000,
  },
  SUGGEST_SALE: {
    DISCOUNT_RATE: 0.05,
    MAX_DELAY: 20000,
    INTERVAL: 60000,
  },
} as const;

export const SALE_MESSAGES = {
  LIGHTNING_SALE: '⚡번개세일! {productName}이(가) 20% 할인 중입니다!',
  SUGGEST_SALE: '💝 {productName}은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!',
} as const;

export type SaleType = 'lightning' | 'suggest';

export interface SaleEventConfig {
  discountRate: number;
  maxDelay: number;
  interval: number;
  message: string;
}

/**
 * 세일 가격 계산 유틸리티
 */
export const calculateLightningSalePrice = (originalPrice: number): number => {
  return Math.round(originalPrice * (1 - SALE_CONFIG.LIGHTNING_SALE.DISCOUNT_RATE));
};

export const calculateSuggestSalePrice = (discountPrice: number): number => {
  return Math.round(discountPrice * (1 - SALE_CONFIG.SUGGEST_SALE.DISCOUNT_RATE));
};

/**
 * 세일 대상 상품 찾기 유틸리티
 */
const isValidLightningTarget = (product: Product): boolean => {
  return product.quantity > 0 && !product.onSale;
};

const isValidSuggestTarget = (product: Product, lastSelectedId: string): boolean => {
  return product.id !== lastSelectedId && product.quantity > 0 && !product.suggestSale;
};

const selectRandomProduct = (products: Product[]): Product | null => {
  if (products.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * products.length);
  return products[randomIndex];
};

export const findLightningSaleTarget = (products: Product[], excludeIds: Set<string>): Product | null => {
  const candidates = products.filter((product) => isValidLightningTarget(product) && !excludeIds.has(product.id));

  return selectRandomProduct(candidates);
};

export const findSuggestSaleTarget = (
  products: Product[],
  lastSelectedId: string | null,
  excludeIds: Set<string>
): Product | null => {
  if (!lastSelectedId) return null;

  // 베이직과 동일하게 find() 사용 (첫 번째 매칭 상품 반환)
  return (
    products.find((product) => isValidSuggestTarget(product, lastSelectedId) && !excludeIds.has(product.id)) || null
  );
};

/**
 * 세일 메시지 처리 유틸리티
 */
export const formatLightningSaleMessage = (productName: string): string => {
  return SALE_MESSAGES.LIGHTNING_SALE.replace('{productName}', productName);
};

export const formatSuggestSaleMessage = (productName: string): string => {
  return SALE_MESSAGES.SUGGEST_SALE.replace('{productName}', productName);
};
