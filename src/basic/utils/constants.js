// 할인 관련 상수
export const DISCOUNT_RATES = {
  // 개별 상품 할인율 (10개 이상 구매 시)
  ITEM_DISCOUNT_THRESHOLD: 10,

  // 대량구매 할인율 (30개 이상 시 25% 할인)
  BULK_PURCHASE_THRESHOLD: 30,
  BULK_PURCHASE_RATE: 0.25,

  // 화요일 특가 할인율 (추가 10% 할인)
  TUESDAY_SPECIAL_RATE: 0.1,

  // 번개세일 할인율 (20% 할인)
  LIGHTNING_SALE_RATE: 0.2,

  // 추천세일 할인율 (5% 할인)
  SUGGEST_SALE_RATE: 0.05,

  // 화요일 요일 (0: 일요일, 1: 월요일, 2: 화요일)
  TUESDAY_DAY: 2,
};

// 포인트 관련 상수
export const POINT_RATES = {
  // 기본 포인트 계산 (최종 결제 금액의 0.1%)
  BASE_POINT_RATE: 0.001,

  // 화요일 포인트 2배 보너스
  TUESDAY_BONUS_MULTIPLIER: 2,

  // 수량별 보너스 포인트
  QUANTITY_BONUS: {
    TIER_1: 20, // 10개 이상
    TIER_2: 50, // 20개 이상
    TIER_3: 100, // 30개 이상
  },

  // 상품 조합 보너스 포인트
  COMBO_BONUS: {
    KEYBOARD_MOUSE: 50, // 키보드+마우스 세트
    FULL_SET: 100, // 풀세트 구매
  },
};

// 수량 임계값
export const QUANTITY_THRESHOLDS = {
  // 개별 상품 할인 임계값
  ITEM_DISCOUNT: 10,

  // 대량구매 할인 임계값
  BULK_PURCHASE: 30,

  // 보너스 포인트 임계값
  BONUS_TIER_1: 10,
  BONUS_TIER_2: 20,
  BONUS_TIER_3: 30,
};

// 시간 관련 상수 (밀리초)
export const TIME_DELAYS = {
  // 번개세일 지연시간 (0-10초)
  LIGHTNING_SALE_MAX: 10000,

  // 추천세일 지연시간 (0-20초)
  SUGGEST_SALE_MAX: 20000,

  // 번개세일 반복 주기 (30초)
  LIGHTNING_SALE_INTERVAL: 30000,

  // 추천세일 반복 주기 (60초)
  SUGGEST_SALE_INTERVAL: 60000,
};

// UI 관련 상수
export const UI_CONSTANTS = {
  // CSS 클래스
  GRID_LAYOUT:
    'grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0',
  PRODUCT_IMAGE_SIZE: 'w-20 h-20',
  PRODUCT_IMAGE_OVERLAY: 'w-[60%] h-[60%]',
  QUANTITY_MIN_WIDTH: 'min-w-[20px]',

  // 색상 클래스
  SALE_COLOR: 'text-red-500',
  SUGGEST_COLOR: 'text-blue-500',

  // 투명도
  OVERLAY_OPACITY: 'bg-black/50',
  GREEN_OPACITY: 'bg-green-500/20',
  WHITE_OPACITY: 'bg-white/10',
  BORDER_OPACITY: 'border-white/10',
};

// 계산 관련 상수
export const CALCULATION_CONSTANTS = {
  // 포인트 계산 기준 (1000원당 1포인트)
  POINT_BASE_AMOUNT: 1000,

  // 퍼센트 변환 (소수점을 퍼센트로)
  PERCENTAGE_MULTIPLIER: 100,

  // 할인율 계산 (1 - 할인율)
  DISCOUNT_CALCULATION: 1,

  // 기본 수량
  DEFAULT_QUANTITY: 1,

  // 최소 수량
  MIN_QUANTITY: 0,
};

// 메시지 상수
export const MESSAGES = {
  LIGHTNING_SALE: '⚡번개세일! {productName}이(가) 20% 할인 중입니다!',
  SUGGEST_SALE: '💝 {productName}은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!',
  EMPTY_CART: '🛍️ 0 items in cart',
  ZERO_AMOUNT: '₩0',
  LOYALTY_POINTS: '적립 포인트: {points}p',
  ZERO_POINTS: '적립 포인트: 0p',
  SAVED_AMOUNT: '₩{amount} 할인되었습니다',
};

// 상품 조합 상수
export const PRODUCT_COMBOS = {
  KEYBOARD_MOUSE: {
    products: ['keyboard', 'mouse'],
    bonusPoints: 50,
    name: '키보드+마우스 세트',
  },
  FULL_SET: {
    products: ['keyboard', 'mouse', 'monitor-arm', 'speaker'],
    bonusPoints: 100,
    name: '풀세트 구매',
  },
};
