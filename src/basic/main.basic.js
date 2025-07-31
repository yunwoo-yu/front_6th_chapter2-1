import { products } from './data';
import {
  addProductToCart,
  calculateAndUpdateCart,
  changeCartItemQuantity,
  createUIUpdater,
  getLastSelectedProduct,
  initProductElements,
  removeCartItem,
  renderProductOptions,
  setLastSelectedProduct,
  startAllSaleEvents,
  updateCartItemPrices,
} from './services';
import {
  closeManualModal,
  createHeader,
  createMainContainer,
  createManualOverlay,
  createManualPanel,
  createManualToggleButton,
  createOrderSummary,
  createProductSelection,
  toggleManualModal,
} from './views';

/**
 * 애플리케이션 초기화 및 실행
 * 클린코드 원칙에 따라 단일 책임만 수행
 */
function main() {
  // 1. DOM 초기화
  const elements = initializeDOM();

  // 2. 서비스 초기화
  const services = initializeServices(elements);

  // 3. 이벤트 리스너 설정
  setupEventListeners(elements, services);

  // 4. 초기 렌더링
  performInitialRender();

  // 5. 세일 이벤트 시작
  startSaleEvents(services);
}

/**
 * DOM 요소 초기화
 * @returns {Object} DOM 요소들
 */
function initializeDOM() {
  const root = document.getElementById('app');

  // UI 컴포넌트 생성
  const cartHeader = createHeader();
  const productSelectionPanel = createProductSelection();
  const shoppingAreaContainer = createMainContainer();
  const orderSummaryPanel = createOrderSummary();
  const helpToggleButton = createManualToggleButton();
  const helpModalOverlay = createManualOverlay();
  const helpModalPanel = createManualPanel();

  // DOM 구조 구성
  shoppingAreaContainer.appendChild(productSelectionPanel);
  shoppingAreaContainer.appendChild(orderSummaryPanel);
  helpModalOverlay.appendChild(helpModalPanel);

  root.appendChild(cartHeader);
  root.appendChild(shoppingAreaContainer);
  root.appendChild(helpToggleButton);
  root.appendChild(helpModalOverlay);

  // 필요한 요소들 추출
  const productSelectDropdown = productSelectionPanel.querySelector('#product-select');
  const stockStatusDisplay = productSelectionPanel.querySelector('#stock-status');
  const cartItemsList = productSelectionPanel.querySelector('#cart-items');
  const addToCartButton = productSelectionPanel.querySelector('#add-to-cart');

  return {
    productSelectDropdown,
    stockStatusDisplay,
    cartItemsList,
    addToCartButton,
    helpToggleButton,
    helpModalOverlay,
  };
}

/**
 * 서비스 초기화
 * @param {Object} elements - DOM 요소들
 * @returns {Object} 서비스들
 */
function initializeServices(elements) {
  // Product Manager 초기화
  initProductElements(elements.productSelectDropdown, elements.stockStatusDisplay);

  // UI 업데이터 생성
  const uiUpdater = createUIUpdater();

  return {
    uiUpdater,
  };
}

/**
 * 이벤트 리스너 설정
 * @param {Object} elements - DOM 요소들
 * @param {Object} services - 서비스들
 */
function setupEventListeners(elements, services) {
  // 도움말 모달 이벤트
  elements.helpToggleButton.onclick = toggleManualModal;
  elements.helpModalOverlay.onclick = (e) => {
    if (e.target === elements.helpModalOverlay) {
      closeManualModal();
    }
  };

  // 장바구니 추가 이벤트
  elements.addToCartButton.addEventListener('click', () => {
    handleAddToCart(elements, services);
  });

  // 장바구니 아이템 이벤트 (수량 변경, 제거)
  elements.cartItemsList.addEventListener('click', (event) => {
    handleCartItemClick(event, elements, services);
  });
}

/**
 * 초기 렌더링 수행
 */
function performInitialRender() {
  renderProductOptions();
  // 초기 계산 수행 (빈 장바구니)
  const elements = {
    cartItemsList: document.querySelector('#cart-items'),
  };
  const services = { uiUpdater: createUIUpdater() };
  calculateCart(elements, services);
}

/**
 * 세일 이벤트 시작
 * @param {Object} services - 서비스들
 */
function startSaleEvents(services) {
  const onProductUpdate = () => {
    renderProductOptions();
    updateCartPrices(services);
  };

  startAllSaleEvents(getLastSelectedProduct(), onProductUpdate);
}

/**
 * 장바구니에 상품 추가 처리
 * @param {Object} elements - DOM 요소들
 * @param {Object} services - 서비스들
 */
function handleAddToCart(elements, services) {
  const selectedItemId = elements.productSelectDropdown.value;

  if (!selectedItemId) return;

  const success = addProductToCart(selectedItemId, products, elements.cartItemsList);

  if (success) {
    setLastSelectedProduct(selectedItemId);
    calculateCart(elements, services);
  }
}

/**
 * 장바구니 아이템 클릭 처리 (수량 변경, 제거)
 * @param {Event} event - 클릭 이벤트
 * @param {Object} elements - DOM 요소들
 * @param {Object} services - 서비스들
 */
function handleCartItemClick(event, elements, services) {
  const target = event.target;

  if (!target.classList.contains('quantity-change') && !target.classList.contains('remove-item')) {
    return;
  }

  const productId = target.dataset.productId;
  let success = false;

  if (target.classList.contains('quantity-change')) {
    const change = parseInt(target.dataset.change);
    success = changeCartItemQuantity(productId, change, products);

    if (!success && change > 0) {
      alert('재고가 부족합니다.');
    }
  } else if (target.classList.contains('remove-item')) {
    success = removeCartItem(productId, products);
  }

  if (success) {
    calculateCart(elements, services);
    renderProductOptions(); // 재고 변경 반영
  }
}

/**
 * 장바구니 계산 및 UI 업데이트
 * 핵심 비즈니스 로직을 서비스로 위임
 * @param {Object} elements - DOM 요소들
 * @param {Object} services - 서비스들
 */
function calculateCart(elements, services) {
  const cartItems = Array.from(elements.cartItemsList.children);
  calculateAndUpdateCart(cartItems, products, services.uiUpdater);
}

/**
 * 장바구니 아이템 가격 업데이트 (세일 반영)
 * @param {Object} services - 서비스들
 */
function updateCartPrices(services) {
  const cartItems = Array.from(document.querySelectorAll('#cart-items > *'));
  updateCartItemPrices(cartItems, products);

  const elements = { cartItemsList: document.querySelector('#cart-items') };
  calculateCart(elements, services);
}

// 애플리케이션 시작
main();
