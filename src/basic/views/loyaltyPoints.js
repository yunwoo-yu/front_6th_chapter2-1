import { QUANTITY_THRESHOLDS } from '../utils/index.js';

/**
 * 포인트 정보 업데이트
 * @param {Object} pointsResult - 포인트 계산 결과
 */
export function updateLoyaltyPoints(pointsResult) {
  const { finalPoints, pointsDetail } = pointsResult;
  const ptsTag = document.getElementById('loyalty-points');

  if (!ptsTag) return;

  if (finalPoints > 0) {
    ptsTag.innerHTML = `
      <div>적립 포인트: <span class="font-bold">${finalPoints}p</span></div>
      <div class="text-2xs opacity-70 mt-1">${pointsDetail.join(', ')}</div>
    `;
    ptsTag.style.display = 'block';
  } else {
    ptsTag.textContent = '적립 포인트: 0p';
    ptsTag.style.display = 'none';
  }
}

/**
 * 장바구니 아이템 스타일 업데이트
 * @param {Array} cartItems - 장바구니 아이템들
 */
export function updateCartItemStyles(cartItems) {
  cartItems.forEach((cartItem) => {
    const quantity = parseInt(cartItem.querySelector('.quantity-number').textContent);
    updateItemFontWeight(cartItem, quantity);
  });
}

/**
 * 아이템 폰트 굵기 업데이트 (10개 이상 볼드)
 * @param {HTMLElement} cartItem - 장바구니 아이템 요소
 * @param {number} quantity - 수량
 */
function updateItemFontWeight(cartItem, quantity) {
  const priceElems = cartItem.querySelectorAll('.text-lg, .text-xs');

  priceElems.forEach((elem) => {
    if (elem.classList.contains('text-lg')) {
      elem.style.fontWeight = quantity >= QUANTITY_THRESHOLDS.ITEM_DISCOUNT ? 'bold' : 'normal';
    }
  });
}
