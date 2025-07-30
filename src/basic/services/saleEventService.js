import { products } from '../data';
import { CALCULATION_CONSTANTS, DISCOUNT_RATES, MESSAGES, TIME_DELAYS } from '../utils';

/**
 * 번개세일 할인 가격 계산
 * @param {Object} product - 상품 정보
 * @returns {number} 할인된 가격
 */
export const calculateLightningSalePrice = (product) => {
  return Math.round(
    (product.price * (CALCULATION_CONSTANTS.DISCOUNT_CALCULATION - DISCOUNT_RATES.LIGHTNING_SALE_RATE)) /
      CALCULATION_CONSTANTS.PERCENTAGE_MULTIPLIER
  );
};

/**
 * 추천세일 할인 가격 계산
 * @param {Object} product - 상품 정보
 * @returns {number} 할인된 가격
 */
export const calculateSuggestSalePrice = (product) => {
  return Math.round(
    (product.discountPrice *
      (CALCULATION_CONSTANTS.PERCENTAGE_MULTIPLIER -
        DISCOUNT_RATES.SUGGEST_SALE_RATE * CALCULATION_CONSTANTS.PERCENTAGE_MULTIPLIER)) /
      CALCULATION_CONSTANTS.PERCENTAGE_MULTIPLIER
  );
};

/**
 * 번개세일 대상 상품 찾기
 * @returns {Object|null} 번개세일 대상 상품 또는 null
 */
export const findLightningSaleTarget = () => {
  const availableProducts = products.filter((product) => product.q > 0 && !product.onSale);

  if (availableProducts.length === 0) return null;

  const luckyIdx = Math.floor(Math.random() * availableProducts.length);
  return availableProducts[luckyIdx];
};

/**
 * 추천세일 대상 상품 찾기
 * @param {string} lastSelectedProductId - 마지막 선택된 상품 ID
 * @returns {Object|null} 추천세일 대상 상품 또는 null
 */
export const findSuggestSaleTarget = (lastSelectedProductId) => {
  if (!lastSelectedProductId) return null;

  return (
    products.find((product) => product.id !== lastSelectedProductId && product.q > 0 && !product.suggestSale) || null
  );
};

/**
 * 번개세일 이벤트 실행
 * @param {Function} onProductUpdate - 상품 업데이트 콜백 함수
 * @returns {boolean} 이벤트 실행 성공 여부
 */
export const executeLightningSale = (onProductUpdate) => {
  const targetProduct = findLightningSaleTarget();

  if (!targetProduct) return false;

  // 할인 가격 적용
  targetProduct.val = calculateLightningSalePrice(targetProduct);
  targetProduct.onSale = true;

  // 알림 표시
  alert(MESSAGES.LIGHTNING_SALE.replace('{productName}', targetProduct.name));

  // UI 업데이트
  if (onProductUpdate) {
    onProductUpdate();
  }

  return true;
};

/**
 * 추천세일 이벤트 실행
 * @param {string} lastSelectedProductId - 마지막 선택된 상품 ID
 * @param {Function} onProductUpdate - 상품 업데이트 콜백 함수
 * @returns {boolean} 이벤트 실행 성공 여부
 */
export const executeSuggestSale = (lastSelectedProductId, onProductUpdate) => {
  const targetProduct = findSuggestSaleTarget(lastSelectedProductId);

  if (!targetProduct) return false;

  // 할인 가격 적용
  targetProduct.discountPrice = calculateSuggestSalePrice(targetProduct);
  targetProduct.suggestSale = true;

  // 알림 표시
  alert(MESSAGES.SUGGEST_SALE.replace('{productName}', targetProduct.name));

  // UI 업데이트
  if (onProductUpdate) {
    onProductUpdate();
  }

  return true;
};

/**
 * 번개세일 스케줄러 시작
 * @param {Function} onProductUpdate - 상품 업데이트 콜백 함수
 * @returns {number} 스케줄러 ID (clearInterval용)
 */
export const startLightningSaleScheduler = (onProductUpdate) => {
  const delay = Math.random() * TIME_DELAYS.LIGHTNING_SALE_MAX;

  setTimeout(() => {
    const intervalId = setInterval(() => {
      executeLightningSale(onProductUpdate);
    }, TIME_DELAYS.LIGHTNING_SALE_INTERVAL);

    return intervalId;
  }, delay);
};

/**
 * 추천세일 스케줄러 시작
 * @param {string} lastSelectedProductId - 마지막 선택된 상품 ID
 * @param {Function} onProductUpdate - 상품 업데이트 콜백 함수
 * @returns {number} 스케줄러 ID (clearInterval용)
 */
export const startSuggestSaleScheduler = (lastSelectedProductId, onProductUpdate) => {
  const delay = Math.random() * TIME_DELAYS.SUGGEST_SALE_MAX;

  setTimeout(() => {
    const intervalId = setInterval(() => {
      executeSuggestSale(lastSelectedProductId, onProductUpdate);
    }, TIME_DELAYS.SUGGEST_SALE_INTERVAL);

    return intervalId;
  }, delay);
};

/**
 * 모든 세일 이벤트 시작
 * @param {string} lastSelectedProductId - 마지막 선택된 상품 ID
 * @param {Function} onProductUpdate - 상품 업데이트 콜백 함수
 * @returns {Object} 스케줄러 ID들
 */
export const startAllSaleEvents = (lastSelectedProductId, onProductUpdate) => {
  const lightningSaleId = startLightningSaleScheduler(onProductUpdate);
  const suggestSaleId = startSuggestSaleScheduler(lastSelectedProductId, onProductUpdate);

  return {
    lightningSaleId,
    suggestSaleId,
  };
};
