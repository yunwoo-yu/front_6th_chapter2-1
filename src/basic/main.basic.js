import { products } from './data';
import { initProductElements, renderProductOptions, renderStockStatus } from './modules';
import { startAllSaleEvents } from './services';
import {
  calculateCartTotals,
  calculateTotalPoints,
  createCartItemHTML,
  QUANTITY_THRESHOLDS,
  updateCartItemDisplay,
} from './utils';
import {
  closeManualModal,
  createHeader,
  createMainContainer,
  createManualOverlay,
  createManualPanel,
  createManualToggleButton,
  createOrderSummary,
  createProductSelection,
  resetHeader,
  resetOrderSummary,
  toggleManualModal,
  updateDiscountInfo,
  updateItemCount,
  updateLoyaltyPoints,
  updateSummaryDetails,
  updateTotalAmount,
  updateTuesdaySpecial,
} from './views';

function main() {
  const root = document.getElementById('app');
  const cartHeader = createHeader();
  const productSelectionPanel = createProductSelection();
  const shoppingAreaContainer = createMainContainer();
  const orderSummaryPanel = createOrderSummary();

  const helpToggleButton = createManualToggleButton();
  const helpModalOverlay = createManualOverlay();
  const helpModalPanel = createManualPanel();

  let loyaltyPoints = 0;
  let totalItemCount = 0;
  let lastSelectedProductId = null;
  let finalTotalAmount = 0;

  // Initialize ProductManager
  const productSelectDropdown = productSelectionPanel.querySelector('#product-select');
  const stockStatusDisplay = productSelectionPanel.querySelector('#stock-status');
  const cartItemsList = productSelectionPanel.querySelector('#cart-items');

  initProductElements(productSelectDropdown, stockStatusDisplay);

  shoppingAreaContainer.appendChild(productSelectionPanel);
  shoppingAreaContainer.appendChild(orderSummaryPanel);
  helpModalOverlay.appendChild(helpModalPanel);

  root.appendChild(cartHeader);
  root.appendChild(shoppingAreaContainer);
  root.appendChild(helpToggleButton);
  root.appendChild(helpModalOverlay);

  helpToggleButton.onclick = toggleManualModal;

  helpModalOverlay.onclick = (e) => {
    if (e.target === helpModalOverlay) {
      closeManualModal();
    }
  };

  renderProductOptions();
  handleCalculateCartStuff();

  // 세일 이벤트 시작
  const onProductUpdate = () => {
    renderProductOptions();
    doUpdatePricesInCart();
  };

  startAllSaleEvents(lastSelectedProductId, onProductUpdate);

  function handleCalculateCartStuff() {
    const cartItems = Array.from(cartItemsList.children);

    if (cartItems.length === 0) {
      resetCartDisplay();
      return;
    }

    // 전체 계산 (유틸리티 함수 사용)
    const calculationResult = calculateCartTotals(cartItems, products);

    // 전역 변수 업데이트
    finalTotalAmount = calculationResult.finalTotal;
    totalItemCount = calculationResult.totalItemCount;

    // UI 업데이트
    updateAllUI(
      calculationResult.subTotal,
      calculationResult.finalTotal,
      calculationResult.itemDiscounts,
      calculationResult.discountRate,
      calculationResult.isTuesday
    );

    // 추가 업데이트
    updateCartItemStyles(cartItems);
    renderStockStatus();
    doRenderBonusPoints();
  }

  // 아이템 폰트 굵기 업데이트 (UI 관련)
  function updateCartItemStyles(cartItems) {
    cartItems.forEach((cartItem) => {
      const quantity = parseInt(cartItem.querySelector('.quantity-number').textContent);
      updateItemFontWeight(cartItem, quantity);
    });
  }

  // 아이템 폰트 굵기 업데이트
  function updateItemFontWeight(cartItem, quantity) {
    const priceElems = cartItem.querySelectorAll('.text-lg, .text-xs');

    priceElems.forEach((elem) => {
      if (elem.classList.contains('text-lg')) {
        elem.style.fontWeight = quantity >= QUANTITY_THRESHOLDS.ITEM_DISCOUNT ? 'bold' : 'normal';
      }
    });
  }

  // 모든 UI 업데이트
  function updateAllUI(subTotal, finalTotal, itemDiscounts, discountRate, isTuesday) {
    updateItemCountDisplay();
    updateTotalAmountDisplay(finalTotal);
    updateTuesdaySpecialDisplay(isTuesday, finalTotal);
    updateSummaryDetailsDisplay(subTotal, itemDiscounts, isTuesday);
    updateDiscountInfoDisplay(discountRate, finalTotal, subTotal);
    updateLoyaltyPointsDisplay(finalTotal);
  }

  // 아이템 수량 업데이트
  function updateItemCountDisplay() {
    updateItemCount(totalItemCount);
  }

  // 총액 업데이트
  function updateTotalAmountDisplay(finalTotal) {
    updateTotalAmount(finalTotal);
  }

  // 화요일 특가 표시 업데이트
  function updateTuesdaySpecialDisplay(isTuesday, finalTotal) {
    updateTuesdaySpecial(isTuesday, finalTotal);
  }

  // 적립 포인트 업데이트
  function updateLoyaltyPointsDisplay(finalTotal) {
    updateLoyaltyPoints(finalTotal);
  }

  // 상세 내역 업데이트 (views 함수 호출)
  function updateSummaryDetailsDisplay(subTotal, itemDiscounts, isTuesday) {
    updateSummaryDetails(subTotal, itemDiscounts, isTuesday);
  }

  // 할인 정보 업데이트 (views 함수 호출)
  function updateDiscountInfoDisplay(discountRate, finalTotal, subTotal) {
    updateDiscountInfo(discountRate, finalTotal, subTotal);
  }

  // 장바구니 비움 시 초기화
  function resetCartDisplay() {
    resetHeader();
    resetOrderSummary();
  }

  function doRenderBonusPoints() {
    const ptsTag = document.getElementById('loyalty-points');

    if (cartItemsList.children.length === 0) {
      ptsTag.style.display = 'none';
      return;
    }

    // 장바구니 상품 정보 수집
    const cartProducts = Array.from(cartItemsList.children)
      .map((node) => products.find((p) => p.id === node.id))
      .filter((product) => product);

    // 포인트 계산 (유틸리티 함수 사용)
    const { finalPoints, pointsDetail } = calculateTotalPoints(finalTotalAmount, cartProducts, totalItemCount);

    // UI 업데이트
    loyaltyPoints = finalPoints;

    if (loyaltyPoints > 0) {
      ptsTag.innerHTML = `
      <div>적립 포인트: <span class="font-bold">${loyaltyPoints}p</span></div>
      <div class="text-2xs opacity-70 mt-1">${pointsDetail.join(', ')}</div>
    `;
    } else {
      ptsTag.textContent = '적립 포인트: 0p';
    }

    ptsTag.style.display = 'block';
  }

  function doUpdatePricesInCart() {
    const cartItems = Array.from(cartItemsList.children);

    cartItems.forEach((cartItem) => {
      const product = products.find((p) => p.id === cartItem.id);

      if (!product) return;

      // 유틸리티 함수 사용
      updateCartItemDisplay(cartItem, product);
    });

    handleCalculateCartStuff();
  }

  const addToCartButton = productSelectionPanel.querySelector('#add-to-cart');
  addToCartButton.addEventListener('click', function () {
    const selectedItemId = productSelectDropdown.value;

    if (!selectedItemId) {
      return;
    }

    const selectedProduct = products.find((p) => p.id === selectedItemId);

    if (!selectedProduct || selectedProduct.quantity <= 0) {
      return;
    }

    const existingCartItem = document.getElementById(selectedProduct.id);

    if (existingCartItem) {
      updateExistingCartItem(existingCartItem, selectedProduct);
    } else {
      addNewCartItem(selectedProduct);
    }

    handleCalculateCartStuff();
    lastSelectedProductId = selectedItemId;
  });

  // 기존 장바구니 아이템 수량 증가
  function updateExistingCartItem(cartItem, product) {
    const quantityElement = cartItem.querySelector('.quantity-number');
    const currentQuantity = parseInt(quantityElement.textContent);
    const newQuantity = currentQuantity + 1;

    if (newQuantity <= product.quantity + currentQuantity) {
      quantityElement.textContent = newQuantity;
      product.quantity--;
    } else {
      alert('재고가 부족합니다.');
    }
  }

  // 새로운 장바구니 아이템 추가
  function addNewCartItem(product) {
    const newItem = document.createElement('div');
    newItem.id = product.id;
    newItem.className =
      'grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0';
    newItem.innerHTML = createCartItemHTML(product);

    cartItemsList.appendChild(newItem);
    product.quantity--;
  }

  cartItemsList.addEventListener('click', function (event) {
    const target = event.target;

    if (!target.classList.contains('quantity-change') && !target.classList.contains('remove-item')) {
      return;
    }

    const productId = target.dataset.productId;
    const itemElement = document.getElementById(productId);
    const product = products.find((p) => p.id === productId);

    if (!product || !itemElement) {
      return;
    }

    if (target.classList.contains('quantity-change')) {
      handleQuantityChange(target, itemElement, product);
    } else if (target.classList.contains('remove-item')) {
      handleItemRemove(itemElement, product);
    }

    // UI 업데이트
    handleCalculateCartStuff();
    renderProductOptions();
  });

  // 수량 변경 처리
  function handleQuantityChange(target, itemElement, product) {
    const quantityChange = parseInt(target.dataset.change);
    const quantityElement = itemElement.querySelector('.quantity-number');
    const currentQuantity = parseInt(quantityElement.textContent);
    const newQuantity = currentQuantity + quantityChange;

    if (newQuantity <= 0) {
      // 수량이 0 이하가 되면 아이템 제거
      removeCartItem(itemElement, product, currentQuantity);
    } else if (newQuantity <= product.quantity + currentQuantity) {
      // 재고 범위 내에서 수량 변경
      updateItemQuantity(quantityElement, product, quantityChange, newQuantity);
    } else {
      // 재고 부족
      alert('재고가 부족합니다.');
    }
  }

  // 아이템 제거 처리
  function handleItemRemove(itemElement, product) {
    const quantityElement = itemElement.querySelector('.quantity-number');
    const currentQuantity = parseInt(quantityElement.textContent);

    removeCartItem(itemElement, product, currentQuantity);
  }

  // 수량 업데이트
  function updateItemQuantity(quantityElement, product, quantityChange, newQuantity) {
    quantityElement.textContent = newQuantity;
    product.quantity -= quantityChange;
  }

  // 장바구니 아이템 제거
  function removeCartItem(itemElement, product, currentQuantity) {
    product.quantity += currentQuantity;
    itemElement.remove();
  }
}

main();
