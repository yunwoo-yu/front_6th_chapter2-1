import { useCallback, useEffect, useRef } from 'react';

import { Product } from '@/lib/products';

const SALE_CONFIG = {
  LIGHTNING_SALE_RATE: 0.2, // 20% 할인
  SUGGEST_SALE_RATE: 0.05, // 5% 할인
  LIGHTNING_SALE_MAX_DELAY: 10000, // 0-10초
  SUGGEST_SALE_MAX_DELAY: 20000, // 0-20초
  LIGHTNING_SALE_INTERVAL: 300000, // 30초 주기
  SUGGEST_SALE_INTERVAL: 600000, // 60초 주기
} as const;

const SALE_MESSAGES = {
  LIGHTNING_SALE: '⚡번개세일! {productName}이(가) 20% 할인 중입니다!',
  SUGGEST_SALE: '💝 {productName}은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!',
} as const;

interface UseSaleEventsProps {
  products: Product[];
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  lastSelectedProductId: string | null;
}

export const useSaleEvents = ({ products, updateProduct, lastSelectedProductId }: UseSaleEventsProps) => {
  const lightningIntervalRef = useRef<number | null>(null);
  const suggestIntervalRef = useRef<number | null>(null);

  const calculateLightningSalePrice = useCallback((product: Product): number => {
    return Math.round(product.price * (1 - SALE_CONFIG.LIGHTNING_SALE_RATE));
  }, []);

  const calculateSuggestSalePrice = useCallback((product: Product): number => {
    return Math.round(product.discountPrice * (1 - SALE_CONFIG.SUGGEST_SALE_RATE));
  }, []);

  const findLightningSaleTarget = useCallback((): Product | null => {
    const availableProducts = products.filter((product) => product.quantity > 0 && !product.onSale);

    if (availableProducts.length === 0) return null;

    const luckyIdx = Math.floor(Math.random() * availableProducts.length);
    return availableProducts[luckyIdx];
  }, [products]);

  const findSuggestSaleTarget = useCallback((): Product | null => {
    if (!lastSelectedProductId) return null;

    return (
      products.find(
        (product) => product.id !== lastSelectedProductId && product.quantity > 0 && !product.suggestSale
      ) || null
    );
  }, [products, lastSelectedProductId]);

  const executeLightningSale = useCallback(() => {
    const targetProduct = findLightningSaleTarget();

    if (!targetProduct) return false;

    const salePrice = calculateLightningSalePrice(targetProduct);

    updateProduct(targetProduct.id, {
      discountPrice: salePrice,
      onSale: true,
    });

    alert(SALE_MESSAGES.LIGHTNING_SALE.replace('{productName}', targetProduct.name));

    return true;
  }, [findLightningSaleTarget, calculateLightningSalePrice, updateProduct]);

  const executeSuggestSale = useCallback(() => {
    const targetProduct = findSuggestSaleTarget();

    if (!targetProduct) return false;

    const salePrice = calculateSuggestSalePrice(targetProduct);

    updateProduct(targetProduct.id, {
      discountPrice: salePrice,
      suggestSale: true,
    });

    alert(SALE_MESSAGES.SUGGEST_SALE.replace('{productName}', targetProduct.name));

    return true;
  }, [findSuggestSaleTarget, calculateSuggestSalePrice, updateProduct]);

  const startLightningSaleScheduler = useCallback(() => {
    const delay = Math.random() * SALE_CONFIG.LIGHTNING_SALE_MAX_DELAY;

    setTimeout(() => {
      lightningIntervalRef.current = window.setInterval(() => {
        executeLightningSale();
      }, SALE_CONFIG.LIGHTNING_SALE_INTERVAL);
    }, delay);
  }, [executeLightningSale]);

  const startSuggestSaleScheduler = useCallback(() => {
    const delay = Math.random() * SALE_CONFIG.SUGGEST_SALE_MAX_DELAY;

    setTimeout(() => {
      suggestIntervalRef.current = window.setInterval(() => {
        executeSuggestSale();
      }, SALE_CONFIG.SUGGEST_SALE_INTERVAL);
    }, delay);
  }, [executeSuggestSale]);

  const startSaleEvents = useCallback(() => {
    startLightningSaleScheduler();
    startSuggestSaleScheduler();
  }, [startLightningSaleScheduler, startSuggestSaleScheduler]);

  const stopSaleEvents = useCallback(() => {
    if (lightningIntervalRef.current) {
      window.clearInterval(lightningIntervalRef.current);
      lightningIntervalRef.current = null;
    }
    if (suggestIntervalRef.current) {
      window.clearInterval(suggestIntervalRef.current);
      suggestIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startSaleEvents();

    return () => {
      stopSaleEvents();
    };
  }, [startSaleEvents, stopSaleEvents]);

  return {
    startSaleEvents,
    stopSaleEvents,
  };
};
