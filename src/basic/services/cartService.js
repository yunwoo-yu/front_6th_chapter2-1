import {
  calculateCartTotals,
  calculateTotalPoints,
  createCartItemHTML,
  updateCartItemDisplay,
} from '../utils/index.js';

/**
 * 장바구니 상태 관리 (통합됨)
 * 전역 변수 대신 상태를 캡슐화하여 관리
 */
let cartState = {
  loyaltyPoints: 0,
  totalItemCount: 0,
  lastSelectedProductId: null,
  finalTotalAmount: 0,
};

// 상태 변경 리스너들
const stateListeners = [];

/**
 * 상태 변경을 구독
 * @param {Function} listener - 상태 변경 시 호출될 함수
 * @returns {Function} 구독 해제 함수
 */
export function subscribeToCartState(listener) {
  stateListeners.push(listener);

  // 구독 해제 함수 반환
  return () => {
    const index = stateListeners.indexOf(listener);
    if (index > -1) {
      stateListeners.splice(index, 1);
    }
  };
}

/**
 * 현재 장바구니 상태 조회
 * @returns {Object} 현재 상태
 */
export function getCartState() {
  return { ...cartState }; // 불변성 보장
}

/**
 * 장바구니 상태 업데이트
 * @param {Object} updates - 업데이트할 상태
 */
export function updateCartState(updates) {
  const prevState = { ...cartState };
  cartState = { ...cartState, ...updates };

  // 모든 리스너에게 변경 알림
  stateListeners.forEach((listener) => {
    listener(cartState, prevState);
  });
}

/**
 * 장바구니 상태 초기화
 */
export function resetCartState() {
  const prevState = { ...cartState };
  cartState = {
    loyaltyPoints: 0,
    totalItemCount: 0,
    lastSelectedProductId: cartState.lastSelectedProductId, // 유지
    finalTotalAmount: 0,
  };

  // 모든 리스너에게 변경 알림
  stateListeners.forEach((listener) => {
    listener(cartState, prevState);
  });
}

/**
 * 마지막 선택 상품 ID 설정
 * @param {string} productId - 상품 ID
 */
export function setLastSelectedProduct(productId) {
  updateCartState({ lastSelectedProductId: productId });
}

/**
 * 마지막 선택 상품 ID 조회
 * @returns {string|null} 마지막 선택 상품 ID
 */
export function getLastSelectedProduct() {
  return cartState.lastSelectedProductId;
}

/**
 * 장바구니 계산 및 상태 업데이트 서비스
 * @param {Array} cartItems - 장바구니 DOM 요소들
 * @param {Array} products - 상품 데이터
 * @param {Object} uiUpdater - UI 업데이트 함수들
 */
export function calculateAndUpdateCart(cartItems, products, uiUpdater) {
  if (cartItems.length === 0) {
    resetCartState();
    uiUpdater.reset();
    return;
  }

  // 1. 계산 수행 (순수 함수)
  const calculationResult = calculateCartTotals(cartItems, products);

  // 2. 상태 업데이트
  updateCartState({
    finalTotalAmount: calculationResult.finalTotal,
    totalItemCount: calculationResult.totalItemCount,
  });

  // 3. 포인트 계산 (순수 함수)
  const cartProducts = extractCartProducts(cartItems, products);
  const pointsResult = calculateTotalPoints(
    calculationResult.finalTotal,
    cartProducts,
    calculationResult.totalItemCount
  );

  // 4. UI 업데이트 (사이드 이펙트)
  uiUpdater.updateAll(calculationResult, pointsResult, cartItems);
}

/**
 * 상품을 장바구니에 추가
 * @param {string} productId - 상품 ID
 * @param {Array} products - 상품 데이터
 * @param {HTMLElement} cartItemsList - 장바구니 목록 요소
 * @returns {boolean} 추가 성공 여부
 */
export function addProductToCart(productId, products, cartItemsList) {
  const product = products.find((p) => p.id === productId);

  if (!product || product.quantity <= 0) {
    return false;
  }

  const existingItem = document.getElementById(productId);

  if (existingItem) {
    return updateExistingCartItem(existingItem, product);
  } else {
    return createNewCartItem(product, cartItemsList);
  }
}

/**
 * 장바구니 아이템 수량 변경
 * @param {string} productId - 상품 ID
 * @param {number} change - 수량 변경값
 * @param {Array} products - 상품 데이터
 * @returns {boolean} 변경 성공 여부
 */
export function changeCartItemQuantity(productId, change, products) {
  const product = products.find((p) => p.id === productId);
  const itemElement = document.getElementById(productId);

  if (!product || !itemElement) return false;

  const quantityElement = itemElement.querySelector('.quantity-number');
  const currentQuantity = parseInt(quantityElement.textContent);
  const newQuantity = currentQuantity + change;

  if (newQuantity <= 0) {
    return removeCartItem(productId, products);
  }

  if (newQuantity <= product.quantity + currentQuantity) {
    quantityElement.textContent = newQuantity;
    product.quantity -= change;
    return true;
  }

  return false; // 재고 부족
}

/**
 * 장바구니에서 아이템 제거
 * @param {string} productId - 상품 ID
 * @param {Array} products - 상품 데이터
 * @returns {boolean} 제거 성공 여부
 */
export function removeCartItem(productId, products) {
  const product = products.find((p) => p.id === productId);
  const itemElement = document.getElementById(productId);

  if (!product || !itemElement) return false;

  const currentQuantity = parseInt(itemElement.querySelector('.quantity-number').textContent);
  product.quantity += currentQuantity;
  itemElement.remove();

  return true;
}

/**
 * 장바구니 아이템 가격 업데이트 (세일 반영)
 * @param {Array} cartItems - 장바구니 DOM 요소들
 * @param {Array} products - 상품 데이터
 */
export function updateCartItemPrices(cartItems, products) {
  cartItems.forEach((cartItem) => {
    const product = products.find((p) => p.id === cartItem.id);
    if (product) {
      updateCartItemDisplay(cartItem, product);
    }
  });
}

// Private helper functions

/**
 * 장바구니에서 상품 정보 추출
 * @param {Array} cartItems - 장바구니 DOM 요소들
 * @param {Array} products - 상품 데이터
 * @returns {Array} 장바구니 상품 배열
 */
function extractCartProducts(cartItems, products) {
  return Array.from(cartItems)
    .map((node) => products.find((p) => p.id === node.id))
    .filter((product) => product);
}

/**
 * 기존 장바구니 아이템 수량 업데이트
 * @param {HTMLElement} cartItem - 장바구니 아이템 요소
 * @param {Object} product - 상품 정보
 * @returns {boolean} 업데이트 성공 여부
 */
function updateExistingCartItem(cartItem, product) {
  const quantityElement = cartItem.querySelector('.quantity-number');
  const currentQuantity = parseInt(quantityElement.textContent);
  const newQuantity = currentQuantity + 1;

  if (newQuantity <= product.quantity + currentQuantity) {
    quantityElement.textContent = newQuantity;
    product.quantity--;
    return true;
  } else {
    alert('재고가 부족합니다.');
    return false;
  }
}

/**
 * 새로운 장바구니 아이템 생성
 * @param {Object} product - 상품 정보
 * @param {HTMLElement} cartItemsList - 장바구니 목록 요소
 * @returns {boolean} 생성 성공 여부
 */
function createNewCartItem(product, cartItemsList) {
  const newItem = document.createElement('div');
  newItem.id = product.id;
  newItem.className =
    'grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0';
  newItem.innerHTML = createCartItemHTML(product);

  cartItemsList.appendChild(newItem);
  product.quantity--;

  return true;
}
