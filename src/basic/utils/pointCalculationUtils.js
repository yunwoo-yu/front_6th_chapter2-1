import { PRODUCT_IDS } from '../data/index.js';
import {
  CALCULATION_CONSTANTS,
  DISCOUNT_RATES,
  POINT_RATES,
  PRODUCT_COMBOS,
  QUANTITY_THRESHOLDS,
} from './constants.js';

/**
 * 기본 포인트 계산 (최종 결제 금액의 0.1%)
 * @param {number} finalTotalAmount - 최종 결제 금액
 * @returns {number} 기본 포인트
 */
export function calculateBasePoints(finalTotalAmount) {
  return Math.floor(finalTotalAmount / CALCULATION_CONSTANTS.POINT_BASE_AMOUNT);
}

/**
 * 화요일 보너스 포인트 계산
 * @param {number} basePoints - 기본 포인트
 * @returns {number} 화요일 적용된 포인트
 */
export function applyTuesdayBonus(basePoints) {
  const isTuesday = new Date().getDay() === DISCOUNT_RATES.TUESDAY_DAY;
  return isTuesday && basePoints > 0 ? basePoints * POINT_RATES.TUESDAY_BONUS_MULTIPLIER : basePoints;
}

/**
 * 상품 조합 보너스 포인트 계산
 * @param {Array} cartProducts - 장바구니 상품 배열
 * @returns {number} 조합 보너스 포인트
 */
export function calculateComboBonus(cartProducts) {
  const hasKeyboard = cartProducts.some((p) => p.id === PRODUCT_IDS.KEYBOARD);
  const hasMouse = cartProducts.some((p) => p.id === PRODUCT_IDS.MOUSE);
  const hasMonitorArm = cartProducts.some((p) => p.id === PRODUCT_IDS.MONITOR_ARM);

  let comboBonus = 0;

  if (hasKeyboard && hasMouse) {
    comboBonus += POINT_RATES.COMBO_BONUS.KEYBOARD_MOUSE;
  }

  if (hasKeyboard && hasMouse && hasMonitorArm) {
    comboBonus += POINT_RATES.COMBO_BONUS.FULL_SET;
  }

  return comboBonus;
}

/**
 * 대량구매 보너스 포인트 계산
 * @param {number} totalItemCount - 전체 상품 수량
 * @returns {number} 대량구매 보너스 포인트
 */
export function calculateQuantityBonus(totalItemCount) {
  if (totalItemCount >= QUANTITY_THRESHOLDS.BONUS_TIER_3) {
    return POINT_RATES.QUANTITY_BONUS.TIER_3;
  } else if (totalItemCount >= QUANTITY_THRESHOLDS.BONUS_TIER_2) {
    return POINT_RATES.QUANTITY_BONUS.TIER_2;
  } else if (totalItemCount >= QUANTITY_THRESHOLDS.BONUS_TIER_1) {
    return POINT_RATES.QUANTITY_BONUS.TIER_1;
  }
  return 0;
}

/**
 * 포인트 상세 내역 생성
 * @param {number} basePoints - 기본 포인트
 * @param {boolean} isTuesday - 화요일 여부
 * @param {Array} cartProducts - 장바구니 상품 배열
 * @param {number} totalItemCount - 전체 상품 수량
 * @returns {Array} 포인트 상세 내역 배열
 */
export function generatePointsDetail(basePoints, isTuesday, cartProducts, totalItemCount) {
  const pointsDetail = [];

  // 기본 포인트
  if (basePoints > 0) {
    pointsDetail.push(`기본: ${basePoints}p`);
  }

  // 화요일 2배 보너스
  if (isTuesday && basePoints > 0) {
    pointsDetail.push('화요일 2배');
  }

  // 상품 조합 체크
  const hasKeyboard = cartProducts.some((p) => p.id === PRODUCT_IDS.KEYBOARD);
  const hasMouse = cartProducts.some((p) => p.id === PRODUCT_IDS.MOUSE);
  const hasMonitorArm = cartProducts.some((p) => p.id === PRODUCT_IDS.MONITOR_ARM);

  // 조합 보너스
  if (hasKeyboard && hasMouse) {
    pointsDetail.push(`${PRODUCT_COMBOS.KEYBOARD_MOUSE.name} +${POINT_RATES.COMBO_BONUS.KEYBOARD_MOUSE}p`);
  }

  if (hasKeyboard && hasMouse && hasMonitorArm) {
    pointsDetail.push(`${PRODUCT_COMBOS.FULL_SET.name} +${POINT_RATES.COMBO_BONUS.FULL_SET}p`);
  }

  // 대량구매 보너스
  if (totalItemCount >= QUANTITY_THRESHOLDS.BONUS_TIER_3) {
    pointsDetail.push(`대량구매(${QUANTITY_THRESHOLDS.BONUS_TIER_3}개+) +${POINT_RATES.QUANTITY_BONUS.TIER_3}p`);
  } else if (totalItemCount >= QUANTITY_THRESHOLDS.BONUS_TIER_2) {
    pointsDetail.push(`대량구매(${QUANTITY_THRESHOLDS.BONUS_TIER_2}개+) +${POINT_RATES.QUANTITY_BONUS.TIER_2}p`);
  } else if (totalItemCount >= QUANTITY_THRESHOLDS.BONUS_TIER_1) {
    pointsDetail.push(`대량구매(${QUANTITY_THRESHOLDS.BONUS_TIER_1}개+) +${POINT_RATES.QUANTITY_BONUS.TIER_1}p`);
  }

  return pointsDetail;
}

/**
 * 전체 포인트 계산 (메인 함수)
 * @param {number} finalTotalAmount - 최종 결제 금액
 * @param {Array} cartProducts - 장바구니 상품 배열
 * @param {number} totalItemCount - 전체 상품 수량
 * @returns {Object} { finalPoints, pointsDetail }
 */
export function calculateTotalPoints(finalTotalAmount, cartProducts, totalItemCount) {
  const basePoints = calculateBasePoints(finalTotalAmount);
  const isTuesday = new Date().getDay() === DISCOUNT_RATES.TUESDAY_DAY;

  let finalPoints = applyTuesdayBonus(basePoints);
  finalPoints += calculateComboBonus(cartProducts);
  finalPoints += calculateQuantityBonus(totalItemCount);

  const pointsDetail = generatePointsDetail(basePoints, isTuesday, cartProducts, totalItemCount);

  return { finalPoints, pointsDetail };
}
