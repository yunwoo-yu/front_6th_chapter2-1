import { useCallback, useRef } from 'react';

import { Product } from '@/lib/products';
import {
  calculateLightningSalePrice,
  calculateSuggestSalePrice,
  findLightningSaleTarget,
  findSuggestSaleTarget,
  formatLightningSaleMessage,
  formatSuggestSaleMessage,
} from '@/utils/saleUtils';

interface SaleExecutorProps {
  products: Product[];
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  lastSelectedProductId: string | null;
}

/**
 * 세일 실행 로직을 담당하는 훅
 */
export const useSaleExecutor = ({ products, updateProduct, lastSelectedProductId }: SaleExecutorProps) => {
  const activeLightningSalesRef = useRef<Set<string>>(new Set());
  const activeSuggestSalesRef = useRef<Set<string>>(new Set());

  const executeLightningSale = useCallback(() => {
    const targetProduct = findLightningSaleTarget(products, activeLightningSalesRef.current);

    if (!targetProduct) {
      return false;
    }

    // 방어 로직: 이미 세일 중인 상품 체크
    if (targetProduct.onSale || activeLightningSalesRef.current.has(targetProduct.id)) {
      return false;
    }

    // 세일 상품으로 등록 (중복 방지)
    activeLightningSalesRef.current.add(targetProduct.id);

    // 가격 계산 및 상품 업데이트
    const salePrice = calculateLightningSalePrice(targetProduct.price);
    updateProduct(targetProduct.id, {
      discountPrice: salePrice,
      onSale: true,
    });

    // 사용자에게 알림
    const message = formatLightningSaleMessage(targetProduct.name);
    alert(message);

    return true;
  }, [products, updateProduct]);

  const executeSuggestSale = useCallback(() => {
    const targetProduct = findSuggestSaleTarget(products, lastSelectedProductId, activeSuggestSalesRef.current);

    if (!targetProduct) {
      return false;
    }

    // 방어 로직: 이미 추천세일 중인 상품 체크
    if (targetProduct.suggestSale || activeSuggestSalesRef.current.has(targetProduct.id)) {
      return false;
    }

    // 추천세일 상품으로 등록 (중복 방지)
    activeSuggestSalesRef.current.add(targetProduct.id);

    // 가격 계산 및 상품 업데이트
    const salePrice = calculateSuggestSalePrice(targetProduct.discountPrice);
    updateProduct(targetProduct.id, {
      discountPrice: salePrice,
      suggestSale: true,
    });

    // 사용자에게 알림
    const message = formatSuggestSaleMessage(targetProduct.name);
    alert(message);

    return true;
  }, [products, updateProduct, lastSelectedProductId]);

  const resetSaleTracking = useCallback(() => {
    activeLightningSalesRef.current.clear();
    activeSuggestSalesRef.current.clear();
  }, []);

  return {
    executeLightningSale,
    executeSuggestSale,
    resetSaleTracking,
  };
};
