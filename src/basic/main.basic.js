import { PRODUCT_IDS, products } from './data';
import {
  createAddToCartButton,
  createCartList,
  createLeftColumn,
  createMainContainer,
  createManualColumn,
  createManualOverlay,
  createManualToggleButton,
  createProductSelectElement,
  createRightColumn,
  createSelectorContainer,
  createShoppingCartHeader,
  createStockInfoDisplay,
} from './views';

function main() {
  const root = document.getElementById('app');
  const cartHeader = createShoppingCartHeader();
  const productSelectionPanel = createLeftColumn();
  const shoppingAreaContainer = createMainContainer();
  const productSelectorContainer = createSelectorContainer();
  const productSelectDropdown = createProductSelectElement();
  const addToCartButton = createAddToCartButton();
  const stockStatusDisplay = createStockInfoDisplay();
  const cartItemsList = createCartList();
  const orderSummaryPanel = createRightColumn();

  const helpToggleButton = createManualToggleButton();
  const helpModalOverlay = createManualOverlay();
  const helpModalPanel = createManualColumn();

  const lightningSaleDelay = Math.random() * 10000;
  const suggestSaleDelay = Math.random() * 20000;
  let loyaltyPoints = 0;
  let totalItemCount = 0;
  let lastSelectedProductId = null;
  let finalTotalAmount = 0;

  productSelectorContainer.appendChild(productSelectDropdown);
  productSelectorContainer.appendChild(addToCartButton);
  productSelectorContainer.appendChild(stockStatusDisplay);
  productSelectionPanel.appendChild(productSelectorContainer);
  productSelectionPanel.appendChild(cartItemsList);
  shoppingAreaContainer.appendChild(productSelectionPanel);
  shoppingAreaContainer.appendChild(orderSummaryPanel);
  helpModalOverlay.appendChild(helpModalPanel);

  root.appendChild(cartHeader);
  root.appendChild(shoppingAreaContainer);
  root.appendChild(helpToggleButton);
  root.appendChild(helpModalOverlay);

  helpToggleButton.onclick = () => {
    helpModalOverlay.classList.toggle('hidden');
    helpModalPanel.classList.toggle('translate-x-full');
  };

  helpModalOverlay.onclick = (e) => {
    if (e.target === helpModalOverlay) {
      helpModalOverlay.classList.add('hidden');
      helpModalPanel.classList.add('translate-x-full');
    }
  };

  onUpdateSelectOptions();
  handleCalculateCartStuff();

  // setTimeout(() => {
  //   setInterval(function () {
  //     const luckyIdx = Math.floor(Math.random() * products.length);
  //     const luckyItem = products[luckyIdx];
  //     if (luckyItem.q > 0 && !luckyItem.onSale) {
  //       luckyItem.val = Math.round((luckyItem.originalVal * 80) / 100);
  //       luckyItem.onSale = true;
  //       alert('⚡번개세일! ' + luckyItem.name + '이(가) 20% 할인 중입니다!');
  //       onUpdateSelectOptions();
  //       doUpdatePricesInCart();
  //     }
  //   }, 30000);
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
  //         alert('💝 ' + suggest.name + '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!');
  //         suggest.val = Math.round((suggest.val * (100 - 5)) / 100);
  //         suggest.suggestSale = true;
  //         onUpdateSelectOptions();
  //         doUpdatePricesInCart();
  //       }
  //     }
  //   }, 60000);
  // }, suggestSaleDelay);

  // 상품 셀렉트 옵션 업데이트
  function onUpdateSelectOptions() {
    let totalStock = 0;

    productSelectDropdown.innerHTML = '';

    function getSaleText(item) {
      let saleText = '';

      if (item.onSale) saleText += ' ⚡SALE';

      if (item.suggestSale) saleText += ' 💝추천';

      return saleText;
    }

    // 상품 표시 정보 생성 함수
    function getProductDisplayInfo(item) {
      const { name, val, originalVal, onSale, suggestSale } = item;

      // 세일 조합에 따른 처리
      if (onSale && suggestSale) {
        return {
          text: `⚡💝${name} - ${originalVal}원 → ${val}원 (25% SUPER SALE!)`,
          className: 'text-purple-600 font-bold',
        };
      }

      if (onSale) {
        return {
          text: `⚡${name} - ${originalVal}원 → ${val}원 (20% SALE!)`,
          className: 'text-red-500 font-bold',
        };
      }

      if (suggestSale) {
        return {
          text: `💝${name} - ${originalVal}원 → ${val}원 (5% 추천할인!)`,
          className: 'text-blue-500 font-bold',
        };
      }

      // 일반 상품
      return {
        text: `${name} - ${val}원${getSaleText(item)}`,
        className: '',
      };
    }

    // 총 재고 계산
    for (let idx = 0; idx < products.length; idx++) {
      totalStock += products[idx].q;
    }

    // 옵션 생성
    products.forEach((item) => {
      const option = document.createElement('option');

      option.value = item.id;

      // 품절 상품 처리
      if (item.q === 0) {
        option.textContent = `${item.name} - ${item.val}원 (품절)${getSaleText(item)}`;
        option.disabled = true;
        option.className = 'text-gray-400';
      } else {
        // 재고 있는 상품 처리
        const { text, className } = getProductDisplayInfo(item);

        option.textContent = text;
        option.className = className;
      }

      productSelectDropdown.appendChild(option);
    });

    // 재고 부족 시 테두리 색상 변경
    productSelectDropdown.style.borderColor = totalStock < 50 ? 'orange' : '';
  }

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
    handleStockInfoUpdate();
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
      const itemTotal = product.val * quantity;

      totalItemCount += quantity;
      subTotal += itemTotal;

      // 10개 이상 개별 할인
      if (quantity >= 10) {
        if (product.discountRate > 0) {
          itemDiscounts.push({ name: product.name, discount: product.discountRate * 100 });
          finalTotalAmount += itemTotal * (1 - product.discountRate);
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
        elem.style.fontWeight = qty >= 10 ? 'bold' : 'normal';
      }
    });
  }

  // 대량구매 및 특별할인 적용
  function applyBulkAndSpecialDiscounts(subTotal) {
    let finalTotal = finalTotalAmount;
    let discountRate = 0;

    // 대량구매 할인 (30개 이상 25%)
    if (totalItemCount >= 30) {
      finalTotal = subTotal * 0.75;
      discountRate = 0.25;
    } else {
      discountRate = (subTotal - finalTotalAmount) / subTotal;
    }

    // 화요일 특가 (추가 10%)
    const isTuesday = new Date().getDay() === 2;

    if (isTuesday && finalTotal > 0) {
      finalTotal *= 0.9;
      discountRate = 1 - finalTotal / subTotal;
    }

    finalTotalAmount = finalTotal;
    return { finalTotal, discountRate, isTuesday };
  }

  // 모든 UI 업데이트
  function updateAllUI(subTotal, finalTotal, itemDiscounts, discountRate, isTuesday) {
    updateItemCount();
    updateTotalAmount(finalTotal);
    updateTuesdaySpecial(isTuesday, finalTotal);
    updateSummaryDetails(subTotal, itemDiscounts, isTuesday);
    updateDiscountInfo(discountRate, finalTotal, subTotal);
    updateLoyaltyPoints(finalTotal);
  }

  // 아이템 수량 업데이트
  function updateItemCount() {
    const itemCountElement = document.getElementById('item-count');

    if (itemCountElement) {
      const previousCount = parseInt(itemCountElement.textContent.match(/\d+/) || [0])[0];

      itemCountElement.textContent = `🛍️ ${totalItemCount} items in cart`;

      if (previousCount !== totalItemCount) {
        itemCountElement.setAttribute('data-changed', 'true');
      }
    }
  }

  // 총액 업데이트
  function updateTotalAmount(finalTotal) {
    const totalDiv = orderSummaryPanel.querySelector('.text-2xl');

    if (totalDiv) {
      totalDiv.textContent = `₩${Math.round(finalTotal).toLocaleString()}`;
    }
  }

  // 화요일 특가 표시 업데이트
  function updateTuesdaySpecial(isTuesday, finalTotal) {
    const tuesdaySpecial = document.getElementById('tuesday-special');

    if (isTuesday && finalTotal > 0) {
      tuesdaySpecial.classList.remove('hidden');
    } else {
      tuesdaySpecial.classList.add('hidden');
    }
  }

  // 적립 포인트 업데이트
  function updateLoyaltyPoints(finalTotal) {
    const loyaltyPointsDiv = document.getElementById('loyalty-points');

    if (loyaltyPointsDiv) {
      const points = Math.floor(finalTotal / 1000);

      loyaltyPointsDiv.textContent = points > 0 ? `적립 포인트: ${points}p` : '적립 포인트: 0p';
      loyaltyPointsDiv.style.display = 'block';
    }
  }

  // 상세 내역 업데이트
  function updateSummaryDetails(subTotal, itemDiscounts, isTuesday) {
    const summaryDetails = document.getElementById('summary-details');

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

  // 장바구니 아이템 상세 렌더링
  function renderCartItemDetails(summaryDetails) {
    Array.from(cartItemsList.children).forEach((cartItem) => {
      const product = products.find((p) => p.id === cartItem.id);
      if (!product) return;

      const qty = parseInt(cartItem.querySelector('.quantity-number').textContent);
      const itemTotal = product.val * qty;

      summaryDetails.innerHTML += `
      <div class="flex justify-between text-xs tracking-wide text-gray-400">
        <span>${product.name} x ${qty}</span>
        <span>₩${itemTotal.toLocaleString()}</span>
      </div>
    `;
    });
  }

  // 할인 상세 렌더링
  function renderDiscountDetails(summaryDetails, itemDiscounts, isTuesday) {
    // 대량구매 할인
    if (totalItemCount >= 30) {
      summaryDetails.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-green-400">
        <span class="text-xs">🎉 대량구매 할인 (30개 이상)</span>
        <span class="text-xs">-25%</span>
      </div>
    `;
    } else if (itemDiscounts.length > 0) {
      // 개별 상품 할인
      itemDiscounts.forEach((item) => {
        summaryDetails.innerHTML += `
        <div class="flex justify-between text-sm tracking-wide text-green-400">
          <span class="text-xs">${item.name} (10개↑)</span>
          <span class="text-xs">-${item.discount}%</span>
        </div>
      `;
      });
    }

    // 화요일 할인
    if (isTuesday && finalTotalAmount > 0) {
      summaryDetails.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-purple-400">
        <span class="text-xs">🌟 화요일 추가 할인</span>
        <span class="text-xs">-10%</span>
      </div>
    `;
    }
  }

  // 할인 정보 업데이트
  function updateDiscountInfo(discountRate, finalTotal, subTotal) {
    const discountInfoDiv = document.getElementById('discount-info');
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

  // 장바구니 비움 시 초기화
  function resetCartDisplay() {
    document.getElementById('item-count').textContent = '🛍️ 0 items in cart';
    document.getElementById('summary-details').innerHTML = '';
    document.getElementById('discount-info').innerHTML = '';
    document.getElementById('tuesday-special').classList.add('hidden');

    const totalDiv = orderSummaryPanel.querySelector('.text-2xl');
    if (totalDiv) {
      totalDiv.textContent = '₩0';
    }

    const loyaltyPointsDiv = document.getElementById('loyalty-points');
    if (loyaltyPointsDiv) {
      loyaltyPointsDiv.style.display = 'none';
    }
  }

  function doRenderBonusPoints() {
    const ptsTag = document.getElementById('loyalty-points');
    const basePoints = Math.floor(finalTotalAmount / 1000);
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
    if (new Date().getDay() === 2 && basePoints > 0) {
      finalPoints = basePoints * 2;
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
      finalPoints += 50;
      pointsDetail.push('키보드+마우스 세트 +50p');
    }

    if (hasKeyboard && hasMouse && hasMonitorArm) {
      finalPoints += 100;
      pointsDetail.push('풀세트 구매 +100p');
    }

    // 대량구매 보너스
    if (totalItemCount >= 30) {
      finalPoints += 100;
      pointsDetail.push('대량구매(30개+) +100p');
    } else if (totalItemCount >= 20) {
      finalPoints += 50;
      pointsDetail.push('대량구매(20개+) +50p');
    } else if (totalItemCount >= 10) {
      finalPoints += 20;
      pointsDetail.push('대량구매(10개+) +20p');
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

  function handleStockInfoUpdate() {
    const infoMessages = products
      .filter((item) => item.q < 5)
      .map((item) => (item.q === 0 ? `${item.name}: 품절` : `${item.name}: 재고 부족 (${item.q}개 남음)`))
      .join('\n');

    stockStatusDisplay.textContent = infoMessages;
  }

  function doUpdatePricesInCart() {
    const cartItems = Array.from(cartItemsList.children);

    cartItems.forEach((cartItem) => {
      const product = products.find((p) => p.id === cartItem.id);

      if (!product) return;

      const priceDiv = cartItem.querySelector('.text-lg');
      const nameDiv = cartItem.querySelector('h3');

      if (product.onSale && product.suggestSale) {
        priceDiv.innerHTML = `<span class="line-through text-gray-400">₩${product.originalVal.toLocaleString()}</span> <span class="text-purple-600">₩${product.val.toLocaleString()}</span>`;
        nameDiv.textContent = `⚡💝${product.name}`;
      } else if (product.onSale) {
        priceDiv.innerHTML = `<span class="line-through text-gray-400">₩${product.originalVal.toLocaleString()}</span> <span class="text-red-500">₩${product.val.toLocaleString()}</span>`;
        nameDiv.textContent = `⚡${product.name}`;
      } else if (product.suggestSale) {
        priceDiv.innerHTML = `<span class="line-through text-gray-400">₩${product.originalVal.toLocaleString()}</span> <span class="text-blue-500">₩${product.val.toLocaleString()}</span>`;
        nameDiv.textContent = `💝${product.name}`;
      } else {
        priceDiv.textContent = `₩${product.val.toLocaleString()}`;
        nameDiv.textContent = product.name;
      }
    });

    handleCalculateCartStuff();
  }

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
      return `₩${product.val.toLocaleString()}`;
    }

    const colorClass = getDiscountColorClass(product);
    return `<span class="line-through text-gray-400">₩${product.originalVal.toLocaleString()}</span> <span class="${colorClass}">₩${product.val.toLocaleString()}</span>`;
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
    onUpdateSelectOptions();
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
