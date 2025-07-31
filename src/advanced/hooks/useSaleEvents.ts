import { useEffect } from 'react';

import { useSaleExecutor } from '@/hooks/useSaleExecutor';
import { useSaleScheduler } from '@/hooks/useSaleScheduler';
import { Product } from '@/lib/products';
import { SALE_CONFIG } from '@/utils/saleUtils';

interface UseSaleEventsProps {
  products: Product[];
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  lastSelectedProductId: string | null;
}

/**
 * 세일 이벤트를 관리하는 메인 훅
 *
 * 책임:
 * - 번개세일과 추천세일 스케줄러 관리
 * - 컴포넌트 생명주기에 따른 정리 작업
 */
export const useSaleEvents = ({ products, updateProduct, lastSelectedProductId }: UseSaleEventsProps) => {
  const lightningScheduler = useSaleScheduler();
  const suggestScheduler = useSaleScheduler();

  const { executeLightningSale, executeSuggestSale } = useSaleExecutor({
    products,
    updateProduct,
    lastSelectedProductId,
  });

  useEffect(() => {
    // 번개세일 스케줄러 시작 (항상 실행)
    const lightningCleanup = lightningScheduler.startScheduler({
      maxDelay: SALE_CONFIG.LIGHTNING_SALE.MAX_DELAY,
      interval: SALE_CONFIG.LIGHTNING_SALE.INTERVAL,
      onExecute: executeLightningSale,
    });

    // 컴포넌트 언마운트 시 정리
    return () => {
      lightningScheduler.stopScheduler();
      if (lightningCleanup) lightningCleanup();
    };
  }, []); // 한 번만 실행

  useEffect(() => {
    // 추천세일 스케줄러는 상품이 선택된 후에만 시작
    if (lastSelectedProductId && !suggestScheduler.isRunning()) {
      const suggestCleanup = suggestScheduler.startScheduler({
        maxDelay: SALE_CONFIG.SUGGEST_SALE.MAX_DELAY,
        interval: SALE_CONFIG.SUGGEST_SALE.INTERVAL,
        onExecute: executeSuggestSale,
      });

      return () => {
        if (suggestCleanup) suggestCleanup();
      };
    }

    return () => {};
  }, [lastSelectedProductId, executeSuggestSale, suggestScheduler]);

  const stopAllSaleEvents = () => {
    lightningScheduler.stopScheduler();
    suggestScheduler.stopScheduler();
  };

  return {
    stopSaleEvents: stopAllSaleEvents,
    isLightningRunning: lightningScheduler.isRunning,
    isSuggestRunning: suggestScheduler.isRunning,
  };
};
