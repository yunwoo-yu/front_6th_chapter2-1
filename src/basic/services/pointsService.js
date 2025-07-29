import { PRODUCT_IDS, products } from '../data.js';
import { POINT_RATES, QUANTITY_THRESHOLDS } from '../utils';

/**
 * 기본 포인트 계산 (최종 결제 금액의 0.1%)
 * @param {number} finalAmount - 최종 결제 금액
 * @returns {number} 기본 포인트
 */
export const calculateBasePoints = (finalAmount) => {
  if (finalAmount <= 0) return 0;
  return Math.floor(finalAmount * POINT_RATES.BASE_RATE);
};

/**
 * 화요일 포인트 2배 보너스 계산
 * @param {number} basePoints - 기본 포인트
 * @param {boolean} isTuesday - 화요일 여부
 * @returns {Object} { points, isTuesdayBonus }
 */
export const calculateTuesdayBonus = (basePoints, isTuesday) => {
  // 화요일이 아니거나 기본 포인트가 0 이하인 경우 early return
  if (!isTuesday || basePoints <= 0) {
    return {
      points: basePoints,
      isTuesdayBonus: false,
    };
  }

  return {
    points: basePoints * POINT_RATES.TUESDAY_MULTIPLIER,
    isTuesdayBonus: true,
  };
};

/**
 * 상품 조합에서 특정 상품들이 있는지 확인
 * @param {Array} cartProducts - 장바구니 상품 배열
 * @returns {Object} 각 상품의 존재 여부
 */
const checkProductExistence = (cartProducts) => {
  return {
    hasKeyboard: cartProducts.some((p) => p.id === PRODUCT_IDS.KEYBOARD),
    hasMouse: cartProducts.some((p) => p.id === PRODUCT_IDS.MOUSE),
    hasMonitorArm: cartProducts.some((p) => p.id === PRODUCT_IDS.MONITOR_ARM),
  };
};

/**
 * 상품 조합 보너스 포인트 계산
 * @param {Array} cartProducts - 장바구니 상품 배열
 * @returns {Object} 조합 보너스 정보
 */
export const calculateComboBonus = (cartProducts) => {
  if (!cartProducts || cartProducts.length === 0) {
    return { comboBonuses: [], totalComboPoints: 0 };
  }

  const { hasKeyboard, hasMouse, hasMonitorArm } = checkProductExistence(cartProducts);
  const comboBonuses = [];
  let totalComboPoints = 0;

  // 키보드 + 마우스 세트 보너스
  if (hasKeyboard && hasMouse) {
    const setBonus = {
      name: '키보드+마우스 세트',
      points: POINT_RATES.COMBO_KEYBOARD_MOUSE,
    };
    comboBonuses.push(setBonus);
    totalComboPoints += setBonus.points;
  }

  // 풀세트 구매 보너스 (키보드 + 마우스 + 모니터암)
  if (hasKeyboard && hasMouse && hasMonitorArm) {
    const fullSetBonus = {
      name: '풀세트 구매',
      points: POINT_RATES.COMBO_FULL_SET,
    };
    comboBonuses.push(fullSetBonus);
    totalComboPoints += fullSetBonus.points;
  }

  return { comboBonuses, totalComboPoints };
};

/**
 * 수량별 보너스 포인트 계산
 * @param {number} totalItemCount - 전체 아이템 수량
 * @returns {Object|null} 수량 보너스 정보
 */
export const calculateQuantityBonus = (totalItemCount) => {
  // 높은 단계부터 확인 (early return 적용)
  if (totalItemCount >= QUANTITY_THRESHOLDS.BONUS_TIER_3) {
    return {
      name: '대량구매(30개+)',
      points: POINT_RATES.QUANTITY_BONUS.TIER_3,
    };
  }

  if (totalItemCount >= QUANTITY_THRESHOLDS.BONUS_TIER_2) {
    return {
      name: '대량구매(20개+)',
      points: POINT_RATES.QUANTITY_BONUS.TIER_2,
    };
  }

  if (totalItemCount >= QUANTITY_THRESHOLDS.BONUS_TIER_1) {
    return {
      name: '대량구매(10개+)',
      points: POINT_RATES.QUANTITY_BONUS.TIER_1,
    };
  }

  return null;
};

/**
 * 장바구니에서 유효한 상품 정보만 추출
 * @param {Array} cartItems - 장바구니 아이템 DOM 배열
 * @returns {Array} 유효한 상품 배열
 */
const extractValidProducts = (cartItems) => {
  return cartItems.map((item) => products.find((p) => p.id === item.id)).filter((product) => product !== undefined);
};

/**
 * 포인트 세부 사항에 항목 추가
 * @param {Array} pointsDetail - 포인트 세부 배열
 * @param {string} description - 설명
 * @param {number} points - 포인트 (선택사항)
 */
const addPointsDetail = (pointsDetail, description, points = null) => {
  const detail = points ? `${description} +${points}p` : description;
  pointsDetail.push(detail);
};

/**
 * 전체 포인트 계산 통합 함수
 * @param {number} finalAmount - 최종 결제 금액
 * @param {Array} cartItems - 장바구니 아이템 DOM 배열
 * @param {number} totalItemCount - 전체 아이템 수량
 * @param {boolean} isTuesday - 화요일 여부
 * @returns {Object} 포인트 계산 결과
 */
export const calculateAllPoints = (finalAmount, cartItems, totalItemCount, isTuesday) => {
  // 빈 장바구니 처리
  if (!cartItems || cartItems.length === 0) {
    return {
      totalPoints: 0,
      pointsDetail: [],
      shouldDisplay: false,
    };
  }

  const pointsDetail = [];
  let totalPoints = 0;

  // 1. 기본 포인트 계산
  const basePoints = calculateBasePoints(finalAmount);
  if (basePoints > 0) {
    pointsDetail.push(`기본: ${basePoints}p`);
  }

  // 2. 화요일 보너스 적용
  const { points: finalBasePoints, isTuesdayBonus } = calculateTuesdayBonus(basePoints, isTuesday);

  totalPoints = finalBasePoints;

  if (isTuesdayBonus) {
    addPointsDetail(pointsDetail, '화요일 2배');
  }

  // 3. 장바구니 상품 정보 추출
  const cartProducts = extractValidProducts(cartItems);

  // 4. 상품 조합 보너스
  const { comboBonuses, totalComboPoints } = calculateComboBonus(cartProducts);
  totalPoints += totalComboPoints;

  comboBonuses.forEach((bonus) => {
    addPointsDetail(pointsDetail, bonus.name, bonus.points);
  });

  // 5. 수량별 보너스
  const quantityBonus = calculateQuantityBonus(totalItemCount);
  if (quantityBonus) {
    totalPoints += quantityBonus.points;
    addPointsDetail(pointsDetail, quantityBonus.name, quantityBonus.points);
  }

  return {
    totalPoints,
    pointsDetail,
    shouldDisplay: totalPoints > 0,
  };
};
