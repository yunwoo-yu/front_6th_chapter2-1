import { DISCOUNT_RATES } from './constants.js';

/**
 * 오늘이 화요일인지 확인
 * @returns {boolean} 화요일이면 true, 아니면 false
 */
export function isTuesday() {
  return new Date().getDay() === DISCOUNT_RATES.TUESDAY_DAY;
}

/**
 * 안전한 나눗셈 연산 (0으로 나누기 방지)
 * @param {number} numerator - 분자
 * @param {number} denominator - 분모
 * @returns {number} 나눗셈 결과 또는 0
 */
export function safeDivision(numerator, denominator) {
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * 숫자를 퍼센트로 변환
 * @param {number} value - 변환할 값 (0-1 사이)
 * @returns {number} 퍼센트 값 (0-100)
 */
export function toPercentage(value) {
  return value * 100;
}

/**
 * 숫자를 통화 형식으로 포맷팅
 * @param {number} amount - 포맷팅할 금액
 * @returns {string} 포맷팅된 통화 문자열
 */
export function formatCurrency(amount) {
  return `₩${Math.round(amount).toLocaleString()}`;
}

/**
 * 할인율을 계산
 * @param {number} originalPrice - 원래 가격
 * @param {number} discountedPrice - 할인된 가격
 * @returns {number} 할인율 (0-1 사이)
 */
export function calculateDiscountRate(originalPrice, discountedPrice) {
  if (originalPrice <= 0) return 0;
  return (originalPrice - discountedPrice) / originalPrice;
}
