/**
 * OrderSummary 컴포넌트
 * 주문 요약, 할인 정보, 포인트 정보를 표시
 */

import { products } from '../data/products.js';
import { CALCULATION_CONSTANTS, DISCOUNT_RATES, QUANTITY_THRESHOLDS } from '../utils/constants.js';

/**
 * OrderSummary HTML 렌더링
 * @returns {string} OrderSummary HTML
 */
function renderOrderSummary() {
  return `
    <h2 class="text-xs font-medium mb-5 tracking-extra-wide uppercase">Order Summary</h2>
    <div class="flex-1 flex flex-col">
      <div id="summary-details" class="space-y-3"></div>
      <div class="mt-auto">
        <div id="discount-info" class="mb-4"></div>
        <div id="cart-total" class="pt-5 border-t border-white/10">
          <div class="flex justify-between items-baseline">
            <span class="text-sm uppercase tracking-wider">Total</span>
            <div class="text-2xl tracking-tight">₩0</div>
          </div>
          <div id="loyalty-points" class="text-xs text-blue-400 mt-2 text-right">적립 포인트: 0p</div>
        </div>
        <div id="tuesday-special" class="mt-4 p-3 bg-white/10 rounded-lg hidden">
          <div class="flex items-center gap-2">
            <span class="text-2xs">🎉</span>
            <span class="text-xs uppercase tracking-wide">Tuesday Special 10% Applied</span>
          </div>
        </div>
      </div>
    </div>
    <button
      class="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30"
    >
      Proceed to Checkout
    </button>
    <p class="mt-4 text-2xs text-white/60 text-center leading-relaxed">
      Free shipping on all orders.<br />
      <span id="points-notice">Earn loyalty points with purchase.</span>
    </p>
  `;
}

/**
 * OrderSummary 컴포넌트 생성
 * @returns {HTMLElement} OrderSummary DOM 요소
 */
export function createOrderSummary() {
  const orderSummary = document.createElement('div');

  orderSummary.className = 'bg-black text-white p-8 flex flex-col';
  orderSummary.innerHTML = renderOrderSummary();

  return orderSummary;
}

/**
 * 총액 업데이트
 * @param {number} total - 총액
 */
export function updateTotalAmount(total) {
  const totalDiv = document.querySelector('#cart-total .text-2xl');

  if (totalDiv) {
    totalDiv.textContent = `₩${Math.round(total).toLocaleString()}`;
  }
}

/**
 * 화요일 특가 표시 업데이트
 * @param {boolean} isTuesday - 화요일 여부
 * @param {number} finalTotal - 최종 금액
 */
export function updateTuesdaySpecial(isTuesday, finalTotal) {
  const tuesdaySpecial = document.getElementById('tuesday-special');

  if (tuesdaySpecial) {
    if (isTuesday && finalTotal > 0) {
      tuesdaySpecial.classList.remove('hidden');
    } else {
      tuesdaySpecial.classList.add('hidden');
    }
  }
}

/**
 * 적립 포인트 업데이트
 * @param {number} points - 포인트
 */
export function updateLoyaltyPoints(points) {
  const loyaltyPointsDiv = document.getElementById('loyalty-points');

  if (loyaltyPointsDiv) {
    if (points > 0) {
      loyaltyPointsDiv.textContent = `적립 포인트: ${points}p`;
      loyaltyPointsDiv.style.display = 'block';
    } else {
      loyaltyPointsDiv.style.display = 'none';
    }
  }
}

/**
 * 상세 내역 업데이트
 * @param {number} subTotal - 소계
 * @param {Array} itemDiscounts - 아이템 할인 정보
 * @param {boolean} isTuesday - 화요일 여부
 */
export function updateSummaryDetails(subTotal, itemDiscounts, isTuesday) {
  const summaryDetails = document.getElementById('summary-details');

  if (!summaryDetails) return;

  summaryDetails.innerHTML = '';

  if (subTotal === 0) return;

  // 각 아이템 표시
  renderCartItemDetails(summaryDetails);

  // 소계 표시
  summaryDetails.innerHTML += `
    <div class="border-t border-white/10 my-3"></div>
    <div class="flex justify-between text-sm tracking-wide">
      <span>Subtotal</span>
      <span>₩${subTotal.toLocaleString()}</span>
    </div>
  `;

  // 할인 표시
  renderDiscountDetails(summaryDetails, itemDiscounts, isTuesday);

  // 무료 배송
  summaryDetails.innerHTML += `
    <div class="flex justify-between text-sm tracking-wide text-gray-400">
      <span>Shipping</span>
      <span>Free</span>
    </div>
  `;
}

/**
 * 장바구니 아이템 상세 렌더링
 * @param {HTMLElement} summaryDetails - 상세 내역 컨테이너
 */
function renderCartItemDetails(summaryDetails) {
  const cartItemsList = document.getElementById('cart-items');

  if (!cartItemsList) return;

  Array.from(cartItemsList.children).forEach((cartItem) => {
    const product = products.find((p) => p.id === cartItem.id);

    if (!product) return;

    const qty = parseInt(cartItem.querySelector('.quantity-number').textContent);
    const itemTotal = product.discountPrice * qty;

    summaryDetails.innerHTML += `
      <div class="flex justify-between text-xs tracking-wide text-gray-400">
        <span>${product.name} x ${qty}</span>
        <span>₩${itemTotal.toLocaleString()}</span>
      </div>
    `;
  });
}

/**
 * 할인 상세 렌더링
 * @param {HTMLElement} summaryDetails - 상세 내역 컨테이너
 * @param {Array} itemDiscounts - 아이템 할인 정보
 * @param {boolean} isTuesday - 화요일 여부
 */
function renderDiscountDetails(summaryDetails, itemDiscounts, isTuesday) {
  const cartItemsList = document.getElementById('cart-items');

  if (!cartItemsList) return;

  const totalItemCount = Array.from(cartItemsList.children).reduce((total, cartItem) => {
    const quantity = parseInt(cartItem.querySelector('.quantity-number').textContent);

    return total + quantity;
  }, 0);

  // 대량구매 할인
  if (totalItemCount >= QUANTITY_THRESHOLDS.BULK_PURCHASE) {
    summaryDetails.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-green-400">
        <span class="text-xs">🎉 대량구매 할인 (${QUANTITY_THRESHOLDS.BULK_PURCHASE}개 이상)</span>
        <span class="text-xs">-${DISCOUNT_RATES.BULK_PURCHASE_RATE * CALCULATION_CONSTANTS.PERCENTAGE_MULTIPLIER}%</span>
      </div>
    `;
  } else if (itemDiscounts && itemDiscounts.length > 0) {
    // 개별 상품 할인
    itemDiscounts.forEach((item) => {
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-sm tracking-wide text-green-400">
          <span class="text-xs">${item.name} (${QUANTITY_THRESHOLDS.ITEM_DISCOUNT}개↑)</span>
          <span class="text-xs">-${item.discount}%</span>
        </div>
      `;
    });
  }

  // 화요일 할인
  if (isTuesday) {
    summaryDetails.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-purple-400">
        <span class="text-xs">🎉 화요일 특가</span>
        <span class="text-xs">-${DISCOUNT_RATES.TUESDAY_SPECIAL_RATE * CALCULATION_CONSTANTS.PERCENTAGE_MULTIPLIER}%</span>
      </div>
    `;
  }
}

/**
 * 할인 정보 업데이트
 * @param {number} discountRate - 할인율
 * @param {number} finalTotal - 최종 금액
 * @param {number} subTotal - 소계
 */
export function updateDiscountInfo(discountRate, finalTotal, subTotal) {
  const discountInfoDiv = document.getElementById('discount-info');

  if (!discountInfoDiv) return;

  discountInfoDiv.innerHTML = '';

  if (discountRate > 0 && finalTotal > 0) {
    const savedAmount = subTotal - finalTotal;

    discountInfoDiv.innerHTML = `
      <div class="bg-green-500/20 rounded-lg p-3">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
          <span class="text-sm font-medium text-green-400">${(discountRate * 100).toFixed(1)}%</span>
        </div>
        <div class="text-2xs text-gray-300">₩${Math.round(savedAmount).toLocaleString()} 할인되었습니다</div>
      </div>
    `;
  }
}

/**
 * OrderSummary 초기화
 */
export function resetOrderSummary() {
  updateTotalAmount(0);
  updateLoyaltyPoints(0);
  updateSummaryDetails('');
  updateDiscountInfo('');
  updateTuesdaySpecial(false, 0);
}
