import { products } from '../data/index.js';

let selectDropdownElement = null;
let stockDisplayElement = null;

/**
 * 상품 관련 DOM 요소 초기화
 * @param {HTMLElement} selectElement - 상품 선택 드롭다운
 * @param {HTMLElement} stockElement - 재고 상태 표시 요소
 */
export function initProductElements(selectElement, stockElement) {
  selectDropdownElement = selectElement;
  stockDisplayElement = stockElement;
}

/**
 * 상품 옵션 렌더링
 */
export function renderProductOptions() {
  if (!selectDropdownElement) return;

  selectDropdownElement.innerHTML = '';

  const totalStockCount = products.reduce((total, product) => total + product.quantity, 0);

  products.forEach((product) => {
    const option = createProductOption(product);
    selectDropdownElement.appendChild(option);
  });

  selectDropdownElement.style.borderColor = totalStockCount < 50 ? 'orange' : '';
}

/**
 * 재고 상태 렌더링
 */
export function renderStockStatus() {
  if (!stockDisplayElement) return;

  const lowStockMessages = products
    .filter((product) => product.quantity < 5)
    .map((product) =>
      product.quantity === 0 ? `${product.name}: 품절` : `${product.name}: 재고 부족 (${product.quantity}개 남음)`
    )
    .join('\n');

  stockDisplayElement.textContent = lowStockMessages;
}

/**
 * ID로 상품 찾기
 * @param {string} productId - 상품 ID
 * @returns {Object|undefined} 상품 객체
 */
export function findProductById(productId) {
  return products.find((product) => product.id === productId);
}

/**
 * 재고 차감
 * @param {string} productId - 상품 ID
 * @param {number} quantity - 차감할 수량
 * @returns {boolean} 성공 여부
 */
export function removeStock(productId, quantity = 1) {
  const product = findProductById(productId);

  if (!product || product.quantity < quantity) return false;

  product.quantity -= quantity;
  return true;
}

/**
 * 재고 복구
 * @param {string} productId - 상품 ID
 * @param {number} quantity - 복구할 수량
 */
export function restoreStock(productId, quantity = 1) {
  const product = findProductById(productId);

  if (product) {
    product.quantity += quantity;
  }
}

/**
 * 상품 옵션 요소 생성
 * @param {Object} product - 상품 정보
 * @returns {HTMLElement} option 요소
 */
function createProductOption(product) {
  const option = document.createElement('option');
  option.value = product.id;

  if (product.quantity === 0) {
    option.textContent = `${product.name} - ${product.discountPrice}원 - 품절`;
    option.disabled = true;
    option.className = 'text-gray-400';
  } else {
    const displayInfo = buildProductDisplayInfo(product);
    option.textContent = displayInfo.text;
    option.className = displayInfo.className;
  }

  return option;
}

/**
 * 세일 텍스트 생성
 * @param {Object} product - 상품 정보
 * @returns {string} 세일 텍스트
 */
function buildSaleText(product) {
  const saleLabels = [];

  if (product.onSale) saleLabels.push(' ⚡SALE');
  if (product.suggestSale) saleLabels.push(' 💝추천');

  return saleLabels.join('');
}

/**
 * 상품 표시 정보 생성
 * @param {Object} product - 상품 정보
 * @returns {Object} 표시 정보 (text, className)
 */
function buildProductDisplayInfo(product) {
  const { name, discountPrice, price, onSale, suggestSale } = product;
  const saleText = buildSaleText(product);

  // 세일 조합별 표시 정보 매핑
  const saleDisplayMap = {
    both: {
      text: `⚡💝${name} - ${price}원 → ${discountPrice}원 (25% SUPER SALE!)`,
      className: 'text-purple-600 font-bold',
    },
    lightning: {
      text: `⚡${name} - ${price}원 → ${discountPrice}원 (20% SALE!)`,
      className: 'text-red-500 font-bold',
    },
    suggest: {
      text: `💝${name} - ${price}원 → ${discountPrice}원 (5% 추천할인!)`,
      className: 'text-blue-500 font-bold',
    },
    none: {
      text: `${name} - ${discountPrice}원${saleText}`,
      className: '',
    },
  };

  if (onSale && suggestSale) return saleDisplayMap.both;
  if (onSale) return saleDisplayMap.lightning;
  if (suggestSale) return saleDisplayMap.suggest;

  return saleDisplayMap.none;
}
