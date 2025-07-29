import { products } from '../data.js';
import { DISCOUNT_RATES, QUANTITY_THRESHOLDS } from '../utils';
import { isTuesday, safeDivision } from '../utils/formatUtils.js';

/**
 * DOM에서 장바구니 아이템 정보 추출
 * @param {HTMLElement} cartItem - 장바구니 아이템 DOM 요소
 * @returns {Object|null} { product, quantity } 또는 null
 */
const extractCartItemData = (cartItem) => {
  const product = products.find((p) => p.id === cartItem.id);
  const quantityElement = cartItem.querySelector('.quantity-number');
  const quantity = parseInt(quantityElement.textContent, 10);

  return { product, quantity };
};

/**
 * 개별 상품의 할인 정보 계산
 * @param {Object} product - 상품 정보
 * @param {number} quantity - 수량
 * @returns {Object} { itemTotal, discountedTotal, hasDiscount, discountInfo }
 */
const calculateSingleItemDiscount = (product, quantity) => {
  const itemTotal = product.discountPrice * quantity;
  const hasItemDiscount = quantity >= QUANTITY_THRESHOLDS.ITEM_DISCOUNT && product.discountRate > 0;

  if (hasItemDiscount) {
    return {
      itemTotal,
      discountedTotal: itemTotal * (1 - product.discountRate),
      hasDiscount: true,
      discountInfo: {
        name: product.name,
        discount: product.discountRate * 100,
      },
    };
  }

  return {
    itemTotal,
    discountedTotal: itemTotal,
    hasDiscount: false,
    discountInfo: null,
  };
};

/**
 * 개별 상품 할인 계산 (10개 이상 구매 시)
 * @param {Array} cartItems - 장바구니 아이템 DOM 배열
 * @returns {Object} { subTotal, itemDiscounts, finalAmount }
 */
export const calculateItemDiscounts = (cartItems) => {
  const itemDiscounts = [];
  let subTotal = 0;
  let finalAmount = 0;

  for (const cartItem of cartItems) {
    const itemData = extractCartItemData(cartItem);

    // 유효하지 않은 아이템은 건너뛰기
    if (!itemData) continue;

    const { product, quantity } = itemData;
    const { itemTotal, discountedTotal, hasDiscount, discountInfo } = calculateSingleItemDiscount(product, quantity);

    subTotal += itemTotal;
    finalAmount += discountedTotal;

    if (hasDiscount && discountInfo) {
      itemDiscounts.push(discountInfo);
    }
  }

  return { subTotal, itemDiscounts, finalAmount };
};

/**
 * 대량구매 할인 계산 (30개 이상 시 25% 할인)
 * @param {number} totalItemCount - 전체 아이템 수량
 * @param {number} subTotal - 소계 금액
 * @param {number} currentFinalAmount - 개별 할인 적용된 금액
 * @returns {Object} { finalAmount, discountRate, hasBulkDiscount }
 */
export const calculateBulkDiscount = (totalItemCount, subTotal, currentFinalAmount) => {
  // 대량구매 할인 조건 확인
  if (totalItemCount >= QUANTITY_THRESHOLDS.BULK_DISCOUNT) {
    const bulkDiscountAmount = subTotal * (1 - DISCOUNT_RATES.BULK_PURCHASE);

    return {
      finalAmount: bulkDiscountAmount,
      discountRate: DISCOUNT_RATES.BULK_PURCHASE,
      hasBulkDiscount: true,
    };
  }

  // 대량구매 할인이 없는 경우, 개별 할인만 적용
  const individualDiscountRate = safeDivision(subTotal - currentFinalAmount, subTotal);

  return {
    finalAmount: currentFinalAmount,
    discountRate: individualDiscountRate,
    hasBulkDiscount: false,
  };
};

/**
 * 화요일 특가 할인 계산 (추가 10% 할인)
 * @param {number} amount - 할인 전 금액
 * @returns {Object} { finalAmount, isTuesday }
 */
export const calculateTuesdayDiscount = (amount) => {
  const todayIsTuesday = isTuesday();

  // 화요일이 아니거나 금액이 0 이하인 경우 early return
  if (!todayIsTuesday || amount <= 0) {
    return {
      finalAmount: amount,
      isTuesday: todayIsTuesday,
    };
  }

  return {
    finalAmount: amount * (1 - DISCOUNT_RATES.TUESDAY_SPECIAL),
    isTuesday: true,
  };
};

/**
 * 전체 할인 계산 통합 함수
 * @param {Array} cartItems - 장바구니 아이템 DOM 배열
 * @param {number} totalItemCount - 전체 아이템 수량
 * @returns {Object} 할인 계산 결과
 */
export const calculateAllDiscounts = (cartItems, totalItemCount) => {
  // 빈 장바구니 처리
  if (!cartItems || cartItems.length === 0) {
    return {
      subTotal: 0,
      finalTotalAmount: 0,
      totalDiscountRate: 0,
      itemDiscounts: [],
      hasBulkDiscount: false,
      isTuesday: isTuesday(),
      savedAmount: 0,
    };
  }

  // 1. 개별 상품 할인 계산
  const { subTotal, itemDiscounts, finalAmount: itemDiscountAmount } = calculateItemDiscounts(cartItems);

  // 2. 대량구매 할인 계산
  const {
    finalAmount: bulkDiscountAmount,
    discountRate,
    hasBulkDiscount,
  } = calculateBulkDiscount(totalItemCount, subTotal, itemDiscountAmount);

  // 3. 화요일 할인 계산
  const { finalAmount: finalTotalAmount, isTuesday: todayIsTuesday } = calculateTuesdayDiscount(bulkDiscountAmount);

  // 4. 최종 할인율 계산
  const totalDiscountRate = todayIsTuesday ? safeDivision(subTotal - finalTotalAmount, subTotal) : discountRate;

  return {
    subTotal,
    finalTotalAmount,
    totalDiscountRate,
    itemDiscounts,
    hasBulkDiscount,
    isTuesday: todayIsTuesday,
    savedAmount: subTotal - finalTotalAmount,
  };
};
