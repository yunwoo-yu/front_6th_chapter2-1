import { Product } from '@/lib/products';

import { isTuesday } from './dateUtils';

// 포인트 관련 상수
export const POINT_CONFIG = {
  // 기본 포인트 계산 (최종 결제 금액의 0.1%)
  BASE_RATE: 0.001,

  // 수량별 보너스 포인트 임계값과 포인트
  QUANTITY_BONUS: {
    TIER_1: { threshold: 10, points: 20 }, // 10개 이상
    TIER_2: { threshold: 20, points: 50 }, // 20개 이상
    TIER_3: { threshold: 30, points: 100 }, // 30개 이상
  },

  // 상품 조합 보너스 포인트
  COMBO_BONUS: {
    KEYBOARD_MOUSE: 50, // 키보드+마우스 세트
    FULL_SET: 100, // 풀세트 구매
  },

  // 화요일 포인트 2배 보너스
  TUESDAY_MULTIPLIER: 2,
} as const;

/**
 * 기본 포인트 계산 (결제 금액의 0.1%, 화요일 2배)
 */
export const calculateBasePoints = (finalAmount: number): number => {
  const basePoints = Math.floor(finalAmount * POINT_CONFIG.BASE_RATE);

  // 화요일에는 기본 포인트 2배
  return isTuesday() ? basePoints * POINT_CONFIG.TUESDAY_MULTIPLIER : basePoints;
};

/**
 * 수량별 보너스 포인트 계산
 */
export const calculateQuantityBonusPoints = (totalQuantity: number): number => {
  const { TIER_1, TIER_2, TIER_3 } = POINT_CONFIG.QUANTITY_BONUS;

  if (totalQuantity >= TIER_3.threshold) {
    return TIER_3.points;
  } else if (totalQuantity >= TIER_2.threshold) {
    return TIER_2.points;
  } else if (totalQuantity >= TIER_1.threshold) {
    return TIER_1.points;
  }

  return 0;
};

/**
 * 키보드+마우스 세트 보너스 포인트 확인
 */
export const hasKeyboardMouseCombo = (selectedProducts: Product[]): boolean => {
  const productIds = selectedProducts.map((product) => product.id);

  return productIds.includes('p1') && productIds.includes('p2'); // 키보드(p1) + 마우스(p2)
};

/**
 * 풀세트 구매 보너스 포인트 확인
 */
export const hasFullSetCombo = (selectedProducts: Product[]): boolean => {
  const productIds = selectedProducts.map((product) => product.id);
  const requiredProducts = ['p1', 'p2', 'p3', 'p5']; // 키보드, 마우스, 모니터암, 스피커

  return requiredProducts.every((id) => productIds.includes(id));
};

/**
 * 조합 보너스 포인트 계산
 */
export const calculateComboBonusPoints = (selectedProducts: Product[]): number => {
  let bonusPoints = 0;

  if (hasKeyboardMouseCombo(selectedProducts)) {
    bonusPoints += POINT_CONFIG.COMBO_BONUS.KEYBOARD_MOUSE;
  }

  if (hasFullSetCombo(selectedProducts)) {
    bonusPoints += POINT_CONFIG.COMBO_BONUS.FULL_SET;
  }

  return bonusPoints;
};

/**
 * 전체 포인트 계산 (기본 + 수량 보너스 + 조합 보너스)
 */
export const calculateTotalPoints = (finalAmount: number, selectedProducts: Product[]): number => {
  const totalQuantity = selectedProducts.reduce((sum, product) => sum + product.quantity, 0);
  const basePoints = calculateBasePoints(finalAmount);
  const quantityBonusPoints = calculateQuantityBonusPoints(totalQuantity);
  const comboBonusPoints = calculateComboBonusPoints(selectedProducts);

  return basePoints + quantityBonusPoints + comboBonusPoints;
};

/**
 * 포인트 상세 정보 조회
 */
export const getPointsBreakdown = (finalAmount: number, selectedProducts: Product[]) => {
  const totalQuantity = selectedProducts.reduce((sum, product) => sum + product.quantity, 0);
  const basePoints = calculateBasePoints(finalAmount);
  const quantityBonusPoints = calculateQuantityBonusPoints(totalQuantity);
  const comboBonusPoints = calculateComboBonusPoints(selectedProducts);
  const totalPoints = basePoints + quantityBonusPoints + comboBonusPoints;
  const hasKeyboardMouse = hasKeyboardMouseCombo(selectedProducts);
  const hasFullSet = hasFullSetCombo(selectedProducts);
  const isTuesdayActive = isTuesday();

  return {
    basePoints,
    quantityBonusPoints,
    comboBonusPoints,
    totalPoints,
    totalQuantity,
    hasKeyboardMouse,
    hasFullSet,
    isTuesdayActive,
    quantityTierText: getQuantityTierText(totalQuantity),
  };
};

/**
 * 수량 티어 정보 조회 (베이직과 동일한 형식)
 */
export const getQuantityTierText = (totalQuantity: number): string => {
  const { TIER_1, TIER_2, TIER_3 } = POINT_CONFIG.QUANTITY_BONUS;

  if (totalQuantity >= TIER_3.threshold) {
    return `대량구매(${TIER_3.threshold}개+) +${TIER_3.points}p`;
  } else if (totalQuantity >= TIER_2.threshold) {
    return `대량구매(${TIER_2.threshold}개+) +${TIER_2.points}p`;
  } else if (totalQuantity >= TIER_1.threshold) {
    return `대량구매(${TIER_1.threshold}개+) +${TIER_1.points}p`;
  }

  return '';
};
