import { PRODUCT_ID, products } from './data';
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

let bonusPts = 0;
let itemCnt = 0;
let lastSel = null;
const selectElement = createProductSelectElement();
const addBtn = createAddToCartButton();
const stockInfo = createStockInfoDisplay();
let totalAmt = 0;
const cartDisp = createCartList();
const rightColumn = createRightColumn();
const sum = rightColumn.querySelector('#cart-total');

function main() {
  const root = document.getElementById('app');
  const shoppingCartHeader = createShoppingCartHeader();
  const mainContainer = createMainContainer();
  const selectorContainer = createSelectorContainer();
  const leftColumn = createLeftColumn();

  const manualToggleButton = createManualToggleButton();
  const manualOverlay = createManualOverlay();
  const manualColumn = createManualColumn();

  const lightningDelay = Math.random() * 10000;

  selectorContainer.appendChild(selectElement);
  selectorContainer.appendChild(addBtn);
  selectorContainer.appendChild(stockInfo);
  leftColumn.appendChild(selectorContainer);
  leftColumn.appendChild(cartDisp);

  manualToggleButton.onclick = function () {
    manualOverlay.classList.toggle('hidden');
    manualColumn.classList.toggle('translate-x-full');
  };

  manualOverlay.onclick = function (e) {
    if (e.target === manualOverlay) {
      manualOverlay.classList.add('hidden');
      manualColumn.classList.add('translate-x-full');
    }
  };

  mainContainer.appendChild(leftColumn);
  mainContainer.appendChild(rightColumn);
  manualOverlay.appendChild(manualColumn);
  root.appendChild(shoppingCartHeader);
  root.appendChild(mainContainer);
  root.appendChild(manualToggleButton);
  root.appendChild(manualOverlay);

  onUpdateSelectOptions();
  handleCalculateCartStuff();

  setTimeout(() => {
    setInterval(function () {
      const luckyIdx = Math.floor(Math.random() * products.length);
      const luckyItem = products[luckyIdx];
      if (luckyItem.q > 0 && !luckyItem.onSale) {
        luckyItem.val = Math.round((luckyItem.originalVal * 80) / 100);
        luckyItem.onSale = true;
        alert('⚡번개세일! ' + luckyItem.name + '이(가) 20% 할인 중입니다!');
        onUpdateSelectOptions();
        doUpdatePricesInCart();
      }
    }, 30000);
  }, lightningDelay);
  setTimeout(function () {
    setInterval(function () {
      if (lastSel) {
        let suggest = null;
        for (let k = 0; k < products.length; k++) {
          if (products[k].id !== lastSel) {
            if (products[k].q > 0) {
              if (!products[k].suggestSale) {
                suggest = products[k];
                break;
              }
            }
          }
        }
        if (suggest) {
          alert('💝 ' + suggest.name + '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!');
          suggest.val = Math.round((suggest.val * (100 - 5)) / 100);
          suggest.suggestSale = true;
          onUpdateSelectOptions();
          doUpdatePricesInCart();
        }
      }
    }, 60000);
  }, Math.random() * 20000);
}

// 상품 셀렉트 옵션 업데이트
function onUpdateSelectOptions() {
  let totalStock = 0;
  selectElement.innerHTML = '';

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

    selectElement.appendChild(option);
  });

  // 재고 부족 시 테두리 색상 변경
  selectElement.style.borderColor = totalStock < 50 ? 'orange' : '';
}

function handleCalculateCartStuff() {
  // 초기화
  totalAmt = 0;
  itemCnt = 0;

  const cartItems = Array.from(cartDisp.children);

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
  let subTotal = 0;
  const itemDiscounts = [];

  cartItems.forEach((cartItem) => {
    const product = products.find((p) => p.id === cartItem.id);
    if (!product) return;

    const qty = parseInt(cartItem.querySelector('.quantity-number').textContent);
    const itemTotal = product.val * qty;

    itemCnt += qty;
    subTotal += itemTotal;

    // 10개 이상 개별 할인
    const discountRate = getItemDiscountRate(product.id, qty);
    if (discountRate > 0) {
      itemDiscounts.push({ name: product.name, discount: discountRate * 100 });
      totalAmt += itemTotal * (1 - discountRate);
    } else {
      totalAmt += itemTotal;
    }

    // 스타일 업데이트 (10개 이상 볼드)
    updateItemFontWeight(cartItem, qty);
  });

  return { subTotal, itemDiscounts };
}

// 상품별 할인율 반환
function getItemDiscountRate(productId, qty) {
  if (qty < 10) return 0;

  const discountRates = {
    [PRODUCT_ID.KEYBOARD]: 0.1,
    [PRODUCT_ID.MOUSE]: 0.15,
    [PRODUCT_ID.MONITOR_ARM]: 0.2,
    [PRODUCT_ID.NOTEBOOK_POUCH]: 0.05,
    [PRODUCT_ID.LO_FI_SPEAKER]: 0.25,
  };

  return discountRates[productId] || 0;
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
  let finalTotal = totalAmt;
  let discountRate = 0;

  // 대량구매 할인 (30개 이상 25%)
  if (itemCnt >= 30) {
    finalTotal = subTotal * 0.75;
    discountRate = 0.25;
  } else {
    discountRate = (subTotal - totalAmt) / subTotal;
  }

  // 화요일 특가 (추가 10%)
  const isTuesday = new Date().getDay() === 2;
  if (isTuesday && finalTotal > 0) {
    finalTotal *= 0.9;
    discountRate = 1 - finalTotal / subTotal;
  }

  totalAmt = finalTotal;
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
    itemCountElement.textContent = `🛍️ ${itemCnt} items in cart`;

    if (previousCount !== itemCnt) {
      itemCountElement.setAttribute('data-changed', 'true');
    }
  }
}

// 총액 업데이트
function updateTotalAmount(finalTotal) {
  const totalDiv = sum.querySelector('.text-2xl');
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
  Array.from(cartDisp.children).forEach((cartItem) => {
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
  if (itemCnt >= 30) {
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
  if (isTuesday && totalAmt > 0) {
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

  const totalDiv = sum.querySelector('.text-2xl');
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
  const basePoints = Math.floor(totalAmt / 1000);
  const pointsDetail = [];
  let finalPoints = 0;

  if (cartDisp.children.length === 0) {
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
  const cartProducts = Array.from(cartDisp.children)
    .map((node) => products.find((p) => p.id === node.id))
    .filter((product) => product);

  const hasKeyboard = cartProducts.some((p) => p.id === PRODUCT_ID.KEYBOARD);
  const hasMouse = cartProducts.some((p) => p.id === PRODUCT_ID.MOUSE);
  const hasMonitorArm = cartProducts.some((p) => p.id === PRODUCT_ID.MONITOR_ARM);

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
  if (itemCnt >= 30) {
    finalPoints += 100;
    pointsDetail.push('대량구매(30개+) +100p');
  } else if (itemCnt >= 20) {
    finalPoints += 50;
    pointsDetail.push('대량구매(20개+) +50p');
  } else if (itemCnt >= 10) {
    finalPoints += 20;
    pointsDetail.push('대량구매(10개+) +20p');
  }

  // UI 업데이트
  bonusPts = finalPoints;

  if (bonusPts > 0) {
    ptsTag.innerHTML = `
      <div>적립 포인트: <span class="font-bold">${bonusPts}p</span></div>
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

  stockInfo.textContent = infoMessages;
}

function doUpdatePricesInCart() {
  const cartItems = Array.from(cartDisp.children);

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

main();

addBtn.addEventListener('click', function () {
  const selItem = selectElement.value;
  let hasItem = false;
  for (let idx = 0; idx < products.length; idx++) {
    if (products[idx].id === selItem) {
      hasItem = true;
      break;
    }
  }
  if (!selItem || !hasItem) {
    return;
  }
  let itemToAdd = null;
  for (let j = 0; j < products.length; j++) {
    if (products[j].id === selItem) {
      itemToAdd = products[j];
      break;
    }
  }
  if (itemToAdd && itemToAdd.q > 0) {
    const item = document.getElementById(itemToAdd['id']);
    if (item) {
      const qtyElem = item.querySelector('.quantity-number');
      const newQty = parseInt(qtyElem['textContent']) + 1;
      if (newQty <= itemToAdd.q + parseInt(qtyElem.textContent)) {
        qtyElem.textContent = newQty;
        itemToAdd['q']--;
      } else {
        alert('재고가 부족합니다.');
      }
    } else {
      const newItem = document.createElement('div');
      newItem.id = itemToAdd.id;
      newItem.className =
        'grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0';
      newItem.innerHTML = `
        <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
          <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
        </div>
        <div>
          <h3 class="text-base font-normal mb-1 tracking-tight">${itemToAdd.onSale && itemToAdd.suggestSale ? '⚡💝' : itemToAdd.onSale ? '⚡' : itemToAdd.suggestSale ? '💝' : ''}${itemToAdd.name}</h3>
          <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
          <p class="text-xs text-black mb-3">${itemToAdd.onSale || itemToAdd.suggestSale ? '<span class="line-through text-gray-400">₩' + itemToAdd.originalVal.toLocaleString() + '</span> <span class="' + (itemToAdd.onSale && itemToAdd.suggestSale ? 'text-purple-600' : itemToAdd.onSale ? 'text-red-500' : 'text-blue-500') + '">₩' + itemToAdd.val.toLocaleString() + '</span>' : '₩' + itemToAdd.val.toLocaleString()}</p>
          <div class="flex items-center gap-4">
            <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${itemToAdd.id}" data-change="-1">−</button>
            <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">1</span>
            <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${itemToAdd.id}" data-change="1">+</button>
          </div>
        </div>
        <div class="text-right">
          <div class="text-lg mb-2 tracking-tight tabular-nums">${itemToAdd.onSale || itemToAdd.suggestSale ? '<span class="line-through text-gray-400">₩' + itemToAdd.originalVal.toLocaleString() + '</span> <span class="' + (itemToAdd.onSale && itemToAdd.suggestSale ? 'text-purple-600' : itemToAdd.onSale ? 'text-red-500' : 'text-blue-500') + '">₩' + itemToAdd.val.toLocaleString() + '</span>' : '₩' + itemToAdd.val.toLocaleString()}</div>
          <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${itemToAdd.id}">Remove</a>
        </div>
      `;
      cartDisp.appendChild(newItem);
      itemToAdd.q--;
    }
    handleCalculateCartStuff();
    lastSel = selItem;
  }
});

cartDisp.addEventListener('click', function (event) {
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
