import {
  resetHeader,
  resetOrderSummary,
  updateCartItemStyles,
  updateDiscountInfo,
  updateItemCount,
  updateLoyaltyPoints,
  updateSummaryDetails,
  updateTotalAmount,
  updateTuesdaySpecial,
} from '../views/index.js';
import { renderStockStatus } from './productService.js';

/**
 * UI 업데이트 서비스 팩토리
 * React 컴포넌트와 유사한 구조로 설계
 */
export function createUIUpdater() {
  return {
    /**
     * 모든 UI 업데이트
     * @param {Object} calculationResult - 계산 결과
     * @param {Object} pointsResult - 포인트 계산 결과
     * @param {Array} cartItems - 장바구니 아이템들
     */
    updateAll(calculationResult, pointsResult, cartItems) {
      const { subTotal, finalTotal, itemDiscounts, discountRate, isTuesday, totalItemCount } = calculationResult;

      // 기본 정보 업데이트
      updateItemCount(totalItemCount);
      updateTotalAmount(finalTotal);
      updateTuesdaySpecial(isTuesday, finalTotal);
      updateSummaryDetails(subTotal, itemDiscounts, isTuesday);
      updateDiscountInfo(discountRate, finalTotal, subTotal);

      // 포인트 업데이트
      updateLoyaltyPoints(pointsResult);

      // 스타일 업데이트
      updateCartItemStyles(cartItems);

      // 재고 상태 업데이트
      renderStockStatus();
    },

    /**
     * 장바구니 초기화 시 UI 리셋
     */
    reset() {
      resetHeader();
      resetOrderSummary();
      updateLoyaltyPoints({ finalPoints: 0, pointsDetail: [] });
    },
  };
}
