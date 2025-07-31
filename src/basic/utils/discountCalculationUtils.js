import { CALCULATION_CONSTANTS, DISCOUNT_RATES, QUANTITY_THRESHOLDS } from './constants.js';
import { isTuesday } from './formatUtils.js';

/**
 * 개별 상품 할인 계산
 * @param {Object} product - 상품 정보
 * @param {number} quantity - 수량
 * @returns {number} 할인된 금액
 */
export function calculateItemDiscount(product, quantity) {
  if (quantity >= QUANTITY_THRESHOLDS.ITEM_DISCOUNT && product.discountRate > 0) {
    const itemTotal = product.discountPrice * quantity;
    return itemTotal * (CALCULATION_CONSTANTS.DISCOUNT_CALCULATION - product.discountRate);
  }
  return product.discountPrice * quantity;
}

/**
 * 개별 상품 할인 정보 생성
 * @param {Object} product - 상품 정보
 * @param {number} quantity - 수량
 * @returns {Object|null} 할인 정보 또는 null
 */
export function getItemDiscountInfo(product, quantity) {
  if (quantity >= QUANTITY_THRESHOLDS.ITEM_DISCOUNT && product.discountRate > 0) {
    return {
      name: product.name,
      discount: product.discountRate * CALCULATION_CONSTANTS.PERCENTAGE_MULTIPLIER,
    };
  }
  return null;
}

/**
 * 장바구니 소계 및 개별 할인 계산
 * @param {Array} cartItems - 장바구니 DOM 요소들
 * @param {Array} products - 상품 데이터
 * @returns {Object} { subTotal, itemDiscounts, finalTotalAmount, totalItemCount }
 */
export function calculateSubtotalAndItemDiscounts(cartItems, products) {
  const itemDiscounts = [];
  let subTotal = 0;
  let finalTotalAmount = 0;
  let totalItemCount = 0;

  cartItems.forEach((cartItem) => {
    const product = products.find((p) => p.id === cartItem.id);

    if (!product) return;

    const quantity = parseInt(cartItem.querySelector('.quantity-number').textContent);
    const itemTotal = product.discountPrice * quantity;

    totalItemCount += quantity;
    subTotal += itemTotal;

    // 개별 상품 할인 적용
    const discountedAmount = calculateItemDiscount(product, quantity);
    finalTotalAmount += discountedAmount;

    // 할인 정보 수집
    const discountInfo = getItemDiscountInfo(product, quantity);
    if (discountInfo) {
      itemDiscounts.push(discountInfo);
    }
  });

  return { subTotal, itemDiscounts, finalTotalAmount, totalItemCount };
}

/**
 * 대량구매 및 특별할인 적용
 * @param {number} subTotal - 소계
 * @param {number} currentFinalTotal - 현재 최종 금액 (개별 할인 적용된)
 * @param {number} totalItemCount - 전체 상품 수량
 * @returns {Object} { finalTotal, discountRate, isTuesday }
 */
export function applyBulkAndSpecialDiscounts(subTotal, currentFinalTotal, totalItemCount) {
  let finalTotal = currentFinalTotal;
  let discountRate = 0;

  // 대량구매 할인 (30개 이상 25%)
  if (totalItemCount >= QUANTITY_THRESHOLDS.BULK_PURCHASE) {
    finalTotal = subTotal * (CALCULATION_CONSTANTS.DISCOUNT_CALCULATION - DISCOUNT_RATES.BULK_PURCHASE_RATE);
    discountRate = DISCOUNT_RATES.BULK_PURCHASE_RATE;
  } else {
    discountRate = (subTotal - finalTotal) / subTotal;
  }

  // 화요일 특가 (추가 10%)
  const isTuesdayToday = isTuesday();

  if (isTuesdayToday && finalTotal > 0) {
    finalTotal *= CALCULATION_CONSTANTS.DISCOUNT_CALCULATION - DISCOUNT_RATES.TUESDAY_SPECIAL_RATE;
    discountRate = CALCULATION_CONSTANTS.DISCOUNT_CALCULATION - finalTotal / subTotal;
  }

  return { finalTotal, discountRate, isTuesday: isTuesdayToday };
}

/**
 * 전체 장바구니 계산 (메인 함수)
 * @param {Array} cartItems - 장바구니 DOM 요소들
 * @param {Array} products - 상품 데이터
 * @returns {Object} 계산 결과
 */
export function calculateCartTotals(cartItems, products) {
  // 1. 기본 계산 (소계, 개별 할인)
  const { subTotal, itemDiscounts, finalTotalAmount, totalItemCount } = calculateSubtotalAndItemDiscounts(
    cartItems,
    products
  );

  // 2. 전체 할인 적용 (대량구매, 화요일)
  const { finalTotal, discountRate, isTuesday } = applyBulkAndSpecialDiscounts(
    subTotal,
    finalTotalAmount,
    totalItemCount
  );

  return {
    subTotal,
    finalTotal,
    itemDiscounts,
    discountRate,
    isTuesday,
    totalItemCount,
  };
}
