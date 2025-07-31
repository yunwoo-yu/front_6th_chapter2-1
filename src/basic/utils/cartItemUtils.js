/**
 * 세일 아이콘 반환
 * @param {Object} product - 상품 정보
 * @returns {string} 세일 아이콘
 */
export function getSaleIcon(product) {
  if (product.onSale && product.suggestSale) {
    return '⚡💝';
  } else if (product.onSale) {
    return '⚡';
  } else if (product.suggestSale) {
    return '💝';
  }
  return '';
}

/**
 * 할인 색상 클래스 반환
 * @param {Object} product - 상품 정보
 * @returns {string} CSS 색상 클래스
 */
export function getDiscountColorClass(product) {
  if (product.onSale && product.suggestSale) {
    return 'text-purple-600';
  } else if (product.onSale) {
    return 'text-red-500';
  } else if (product.suggestSale) {
    return 'text-blue-500';
  }
  return '';
}

/**
 * 가격 HTML 반환
 * @param {Object} product - 상품 정보
 * @returns {string} 가격 HTML
 */
export function getPriceHTML(product) {
  if (!product.onSale && !product.suggestSale) {
    return `₩${product.discountPrice.toLocaleString()}`;
  }

  const colorClass = getDiscountColorClass(product);
  return `<span class="line-through text-gray-400">₩${product.price.toLocaleString()}</span> <span class="${colorClass}">₩${product.discountPrice.toLocaleString()}</span>`;
}

/**
 * 장바구니 아이템 HTML 생성
 * @param {Object} product - 상품 정보
 * @returns {string} 장바구니 아이템 HTML
 */
export function createCartItemHTML(product) {
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

/**
 * 장바구니 아이템의 가격 및 이름 업데이트
 * @param {HTMLElement} cartItem - 장바구니 아이템 DOM 요소
 * @param {Object} product - 상품 정보
 */
export function updateCartItemDisplay(cartItem, product) {
  const priceDiv = cartItem.querySelector('.text-lg');
  const nameDiv = cartItem.querySelector('h3');
  const saleIcon = getSaleIcon(product);
  const priceHTML = getPriceHTML(product);

  if (priceDiv) {
    priceDiv.innerHTML = priceHTML;
  }

  if (nameDiv) {
    nameDiv.textContent = `${saleIcon}${product.name}`;
  }
}
