/**
 * ProductSelection 컴포넌트
 * 상품 선택, 장바구니 추가, 재고 정보를 표시
 */

/**
 * 상품 선택 드롭다운 생성
 * @returns {HTMLElement} 상품 선택 요소
 */
export function createProductSelect() {
  const productSelect = document.createElement('select');

  productSelect.id = 'product-select';
  productSelect.className = 'w-full p-3 border border-gray-300 rounded-lg text-base mb-3';

  return productSelect;
}

/**
 * 장바구니 추가 버튼 생성
 * @returns {HTMLElement} 장바구니 추가 버튼
 */
export function createAddToCartButton() {
  const addToCartButton = document.createElement('button');

  addToCartButton.id = 'add-to-cart';
  addToCartButton.innerHTML = 'Add to Cart';
  addToCartButton.className =
    'w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all';

  return addToCartButton;
}

/**
 * 재고 정보 표시 요소 생성
 * @returns {HTMLElement} 재고 정보 요소
 */
export function createStockInfo() {
  const stockInfo = document.createElement('div');

  stockInfo.id = 'stock-status';
  stockInfo.className = 'text-xs text-red-500 mt-3 whitespace-pre-line';

  return stockInfo;
}

/**
 * 장바구니 목록 컨테이너 생성
 * @returns {HTMLElement} 장바구니 목록 요소
 */
export function createCartList() {
  const cartList = document.createElement('div');

  cartList.id = 'cart-items';

  return cartList;
}

/**
 * 상품 선택 컨테이너 생성
 * @returns {HTMLElement} 상품 선택 컨테이너
 */
export function createSelectorContainer() {
  const selectorContainer = document.createElement('div');

  selectorContainer.className = 'mb-6 pb-6 border-b border-gray-200';

  return selectorContainer;
}

/**
 * ProductSelection 컴포넌트 생성
 * @returns {HTMLElement} ProductSelection DOM 요소
 */
export function createProductSelection() {
  const productSelection = document.createElement('div');

  productSelection.className = 'bg-white border border-gray-200 p-8 overflow-y-auto';

  const selectorContainer = createSelectorContainer();
  const productSelect = createProductSelect();
  const addToCartButton = createAddToCartButton();
  const stockInfo = createStockInfo();
  const cartList = createCartList();

  selectorContainer.appendChild(productSelect);
  selectorContainer.appendChild(addToCartButton);
  selectorContainer.appendChild(stockInfo);
  productSelection.appendChild(selectorContainer);
  productSelection.appendChild(cartList);

  return productSelection;
}

/**
 * 재고 정보 업데이트
 * @param {string} message - 표시할 메시지
 */
export function updateStockInfo(message) {
  const stockInfo = document.getElementById('stock-status');

  if (stockInfo) {
    stockInfo.textContent = message;
  }
}

/**
 * 재고 정보 초기화
 */
export function clearStockInfo() {
  const stockInfo = document.getElementById('stock-status');

  if (stockInfo) {
    stockInfo.textContent = '';
  }
}
