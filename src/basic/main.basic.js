import { PRODUCT_IDS, products } from './data';
import { initProductElements, renderProductOptions, renderStockStatus } from './modules';
import {
  CALCULATION_CONSTANTS,
  DISCOUNT_RATES,
  isTuesday,
  POINT_RATES,
  PRODUCT_COMBOS,
  QUANTITY_THRESHOLDS,
  TIME_DELAYS,
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

  const lightningSaleDelay = Math.random() * TIME_DELAYS.LIGHTNING_SALE_MAX;
  const suggestSaleDelay = Math.random() * TIME_DELAYS.SUGGEST_SALE_MAX;
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

  // setTimeout(() => {
  //   setInterval(function () {
  //     const luckyIdx = Math.floor(Math.random() * products.length);
  //     const luckyItem = products[luckyIdx];
  //     if (luckyItem.q > 0 && !luckyItem.onSale) {
  //       luckyItem.val = Math.round((luckyItem.price * (CALCULATION_CONSTANTS.DISCOUNT_CALCULATION - DISCOUNT_RATES.LIGHTNING_SALE_RATE)) / CALCULATION_CONSTANTS.PERCENTAGE_MULTIPLIER);
  //       luckyItem.onSale = true;
  //       alert(MESSAGES.LIGHTNING_SALE.replace('{productName}', luckyItem.name));
  //       renderProductOptions();
  //       doUpdatePricesInCart();
  //     }
  //   }, TIME_DELAYS.LIGHTNING_SALE_INTERVAL);
  // }, lightningSaleDelay);
  // setTimeout(function () {
  //   setInterval(function () {
  //     if (lastSelectedProductId) {
  //       let suggest = null;
  //       for (let k = 0; k < products.length; k++) {
  //         if (products[k].id !== lastSelectedProductId) {
  //           if (products[k].q > 0) {
  //             if (!products[k].suggestSale) {
  //               suggest = products[k];
  //               break;
  //             }
  //           }
  //         }
  //       }
  //       if (suggest) {
  //         alert(MESSAGES.SUGGEST_SALE.replace('{productName}', suggest.name));
  //         suggest.discountPrice = Math.round((suggest.discountPrice * (CALCULATION_CONSTANTS.PERCENTAGE_MULTIPLIER - DISCOUNT_RATES.SUGGEST_SALE_RATE * CALCULATION_CONSTANTS.PERCENTAGE_MULTIPLIER)) / CALCULATION_CONSTANTS.PERCENTAGE_MULTIPLIER);
  //         suggest.suggestSale = true;
  //         renderProductOptions();
  //         doUpdatePricesInCart();
  //       }
  //     }
  //   }, TIME_DELAYS.SUGGEST_SALE_INTERVAL);
  // }, suggestSaleDelay);

  function handleCalculateCartStuff() {
    const cartItems = Array.from(cartItemsList.children);

    // 초기화
    finalTotalAmount = 0;
    totalItemCount = 0;

    if (cartItems.length === 0) {
      resetCartDisplay();
      return;
    }

    // 1. 기본 계산 (소계, 개별 할인)
    const { subTotal, itemDiscounts } = calculateSubtotalAndItemDiscounts(cartItems);

    // 2. 전체 할인 적용 (대량구매, 화요일)
    const { finalTotal, discountRate, isTuesday } = applyBulkAndSpecialDiscounts(subTotal);

    // 3. UI 업데이트
    updateAllUI(subTotal, finalTotal, itemDiscounts, discountRate, isTuesday);

    // 4. 추가 업데이트
    renderStockStatus();
    doRenderBonusPoints();
  }

  // 소계 및 개별상품 할인 계산
  function calculateSubtotalAndItemDiscounts(cartItems) {
    const itemDiscounts = [];
    let subTotal = 0;

    cartItems.forEach((cartItem) => {
      const product = products.find((p) => p.id === cartItem.id);

      if (!product) return;

      const quantity = parseInt(cartItem.querySelector('.quantity-number').textContent);
      const itemTotal = product.discountPrice * quantity;

      totalItemCount += quantity;
      subTotal += itemTotal;

      // 개별 상품 할인 (10개 이상 구매 시)
      if (quantity >= QUANTITY_THRESHOLDS.ITEM_DISCOUNT) {
        if (product.discountRate > 0) {
          itemDiscounts.push({
            name: product.name,
            discount: product.discountRate * CALCULATION_CONSTANTS.PERCENTAGE_MULTIPLIER,
          });
          finalTotalAmount += itemTotal * (CALCULATION_CONSTANTS.DISCOUNT_CALCULATION - product.discountRate);
        }
      } else {
        finalTotalAmount += itemTotal;
      }

      // 스타일 업데이트 (10개 이상 볼드)
      updateItemFontWeight(cartItem, quantity);
    });

    return { subTotal, itemDiscounts };
  }

  // 아이템 폰트 굵기 업데이트
  function updateItemFontWeight(cartItem, qty) {
    const priceElems = cartItem.querySelectorAll('.text-lg, .text-xs');

    priceElems.forEach((elem) => {
      if (elem.classList.contains('text-lg')) {
        elem.style.fontWeight = qty >= QUANTITY_THRESHOLDS.ITEM_DISCOUNT ? 'bold' : 'normal';
      }
    });
  }

  // 대량구매 및 특별할인 적용
  function applyBulkAndSpecialDiscounts(subTotal) {
    let finalTotal = finalTotalAmount;
    let discountRate = 0;

    // 대량구매 할인 (30개 이상 25%)
    if (totalItemCount >= QUANTITY_THRESHOLDS.BULK_PURCHASE) {
      finalTotal = subTotal * (CALCULATION_CONSTANTS.DISCOUNT_CALCULATION - DISCOUNT_RATES.BULK_PURCHASE_RATE);
      discountRate = DISCOUNT_RATES.BULK_PURCHASE_RATE;
    } else {
      discountRate = (subTotal - finalTotalAmount) / subTotal;
    }

    // 화요일 특가 (추가 10%)
    const isTuesdayToday = isTuesday();

    if (isTuesdayToday && finalTotal > 0) {
      finalTotal *= CALCULATION_CONSTANTS.DISCOUNT_CALCULATION - DISCOUNT_RATES.TUESDAY_SPECIAL_RATE;
      discountRate = CALCULATION_CONSTANTS.DISCOUNT_CALCULATION - finalTotal / subTotal;
    }

    finalTotalAmount = finalTotal;
    return { finalTotal, discountRate, isTuesday };
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
    const basePoints = Math.floor(finalTotalAmount / CALCULATION_CONSTANTS.POINT_BASE_AMOUNT);
    const pointsDetail = [];
    let finalPoints = 0;

    if (cartItemsList.children.length === 0) {
      ptsTag.style.display = 'none';
      return;
    }

    // 기본 포인트
    if (basePoints > 0) {
      finalPoints = basePoints;
      pointsDetail.push(`기본: ${basePoints}p`);
    }

    // 화요일 2배 보너스
    if (new Date().getDay() === DISCOUNT_RATES.TUESDAY_DAY && basePoints > 0) {
      finalPoints = basePoints * POINT_RATES.TUESDAY_BONUS_MULTIPLIER;
      pointsDetail.push('화요일 2배');
    }

    // 상품 조합 체크
    const cartProducts = Array.from(cartItemsList.children)
      .map((node) => products.find((p) => p.id === node.id))
      .filter((product) => product);

    const hasKeyboard = cartProducts.some((p) => p.id === PRODUCT_IDS.KEYBOARD);
    const hasMouse = cartProducts.some((p) => p.id === PRODUCT_IDS.MOUSE);
    const hasMonitorArm = cartProducts.some((p) => p.id === PRODUCT_IDS.MONITOR_ARM);

    // 조합 보너스
    if (hasKeyboard && hasMouse) {
      finalPoints += POINT_RATES.COMBO_BONUS.KEYBOARD_MOUSE;
      pointsDetail.push(`${PRODUCT_COMBOS.KEYBOARD_MOUSE.name} +${POINT_RATES.COMBO_BONUS.KEYBOARD_MOUSE}p`);
    }

    if (hasKeyboard && hasMouse && hasMonitorArm) {
      finalPoints += POINT_RATES.COMBO_BONUS.FULL_SET;
      pointsDetail.push(`${PRODUCT_COMBOS.FULL_SET.name} +${POINT_RATES.COMBO_BONUS.FULL_SET}p`);
    }

    // 대량구매 보너스
    if (totalItemCount >= QUANTITY_THRESHOLDS.BONUS_TIER_3) {
      finalPoints += POINT_RATES.QUANTITY_BONUS.TIER_3;
      pointsDetail.push(`대량구매(${QUANTITY_THRESHOLDS.BONUS_TIER_3}개+) +${POINT_RATES.QUANTITY_BONUS.TIER_3}p`);
    } else if (totalItemCount >= QUANTITY_THRESHOLDS.BONUS_TIER_2) {
      finalPoints += POINT_RATES.QUANTITY_BONUS.TIER_2;
      pointsDetail.push(`대량구매(${QUANTITY_THRESHOLDS.BONUS_TIER_2}개+) +${POINT_RATES.QUANTITY_BONUS.TIER_2}p`);
    } else if (totalItemCount >= QUANTITY_THRESHOLDS.BONUS_TIER_1) {
      finalPoints += POINT_RATES.QUANTITY_BONUS.TIER_1;
      pointsDetail.push(`대량구매(${QUANTITY_THRESHOLDS.BONUS_TIER_1}개+) +${POINT_RATES.QUANTITY_BONUS.TIER_1}p`);
    }

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

      const priceDiv = cartItem.querySelector('.text-lg');
      const nameDiv = cartItem.querySelector('h3');

      if (product.onSale && product.suggestSale) {
        priceDiv.innerHTML = `<span class="line-through text-gray-400">₩${product.price.toLocaleString()}</span> <span class="text-purple-600">₩${product.discountPrice.toLocaleString()}</span>`;
        nameDiv.textContent = `⚡💝${product.name}`;
      } else if (product.onSale) {
        priceDiv.innerHTML = `<span class="line-through text-gray-400">₩${product.price.toLocaleString()}</span> <span class="text-red-500">₩${product.discountPrice.toLocaleString()}</span>`;
        nameDiv.textContent = `⚡${product.name}`;
      } else if (product.suggestSale) {
        priceDiv.innerHTML = `<span class="line-through text-gray-400">₩${product.price.toLocaleString()}</span> <span class="text-blue-500">₩${product.discountPrice.toLocaleString()}</span>`;
        nameDiv.textContent = `💝${product.name}`;
      } else {
        priceDiv.textContent = `₩${product.discountPrice.toLocaleString()}`;
        nameDiv.textContent = product.name;
      }
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

    if (!selectedProduct || selectedProduct.q <= 0) {
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
    const qtyElement = cartItem.querySelector('.quantity-number');
    const currentQty = parseInt(qtyElement.textContent);
    const newQty = currentQty + 1;

    if (newQty <= product.q + currentQty) {
      qtyElement.textContent = newQty;
      product.q--;
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
    product.q--;
  }

  // 장바구니 아이템 HTML 생성
  function createCartItemHTML(product) {
    const saleIcon = getSaleIcon(product);
    const priceHTML = getPriceHTML(product);

    return `
    <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
      <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
    </div>
    <div>
      <h3 class="text-base font-normal mb-1 tracking-tight">${saleIcon}${product.name}</h3>
      <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
      <p class="text-xs text-black mb-3">${priceHTML}</p>
      <div class="flex items-center gap-4">
        <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${product.id}" data-change="-1">−</button>
        <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">1</span>
        <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${product.id}" data-change="1">+</button>
      </div>
    </div>
    <div class="text-right">
      <div class="text-lg mb-2 tracking-tight tabular-nums">${priceHTML}</div>
      <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${product.id}">Remove</a>
    </div>
  `;
  }

  // 세일 아이콘 반환
  function getSaleIcon(product) {
    if (product.onSale && product.suggestSale) {
      return '⚡💝';
    } else if (product.onSale) {
      return '⚡';
    } else if (product.suggestSale) {
      return '💝';
    }
    return '';
  }

  // 가격 HTML 반환
  function getPriceHTML(product) {
    if (!product.onSale && !product.suggestSale) {
      return `₩${product.discountPrice.toLocaleString()}`;
    }

    const colorClass = getDiscountColorClass(product);
    return `<span class="line-through text-gray-400">₩${product.price.toLocaleString()}</span> <span class="${colorClass}">₩${product.discountPrice.toLocaleString()}</span>`;
  }

  // 할인 색상 클래스 반환
  function getDiscountColorClass(product) {
    if (product.onSale && product.suggestSale) {
      return 'text-purple-600';
    } else if (product.onSale) {
      return 'text-red-500';
    } else if (product.suggestSale) {
      return 'text-blue-500';
    }
    return '';
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
    const qtyElement = itemElement.querySelector('.quantity-number');
    const currentQty = parseInt(qtyElement.textContent);
    const newQty = currentQty + quantityChange;

    if (newQty <= 0) {
      // 수량이 0 이하가 되면 아이템 제거
      removeCartItem(itemElement, product, currentQty);
    } else if (newQty <= product.q + currentQty) {
      // 재고 범위 내에서 수량 변경
      updateItemQuantity(qtyElement, product, quantityChange, newQty);
    } else {
      // 재고 부족
      alert('재고가 부족합니다.');
    }
  }

  // 아이템 제거 처리
  function handleItemRemove(itemElement, product) {
    const qtyElement = itemElement.querySelector('.quantity-number');
    const currentQty = parseInt(qtyElement.textContent);

    removeCartItem(itemElement, product, currentQty);
  }

  // 수량 업데이트
  function updateItemQuantity(qtyElement, product, quantityChange, newQty) {
    qtyElement.textContent = newQty;
    product.q -= quantityChange;
  }

  // 장바구니 아이템 제거
  function removeCartItem(itemElement, product, currentQty) {
    product.q += currentQty;
    itemElement.remove();
  }
}

main();
