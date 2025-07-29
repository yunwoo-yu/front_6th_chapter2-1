import { products } from '../data';

let selectDropdownElement = null;
let stockDisplayElement = null;

export function initProductElements(selectElement, stockElement) {
  selectDropdownElement = selectElement;
  stockDisplayElement = stockElement;
}

export function renderProductOptions() {
  if (!selectDropdownElement) return;

  selectDropdownElement.innerHTML = '';
  const totalStockCount = products.reduce((total, product) => total + product.q, 0);

  products.forEach((product) => {
    const option = createProductOption(product);

    selectDropdownElement.appendChild(option);
  });

  selectDropdownElement.style.borderColor = totalStockCount < 50 ? 'orange' : '';
}

export function renderStockStatus() {
  if (!stockDisplayElement) return;

  const lowStockMessages = products
    .filter((product) => product.q < 5)
    .map((product) => (product.q === 0 ? `${product.name}: 품절` : `${product.name}: 재고 부족 (${product.q}개 남음)`))
    .join('\n');

  stockDisplayElement.textContent = lowStockMessages;
}

export function findProductById(productId) {
  return products.find((product) => product.id === productId);
}

export function removeStock(productId, qty = 1) {
  const product = findProductById(productId);

  if (!product || product.q < qty) return false;

  product.q -= qty;

  return true;
}

export function addStock(productId, qty = 1) {
  const product = findProductById(productId);

  if (!product) return false;

  product.q += qty;

  return true;
}

export function validateStock(productId, requestedQty) {
  const product = findProductById(productId);

  return product ? product.q >= requestedQty : false;
}

function createProductOption(product) {
  const option = document.createElement('option');

  option.value = product.id;

  if (product.q === 0) {
    const saleText = buildSaleText(product);

    option.textContent = `${product.name} - ${product.discountPrice}원 (품절)${saleText}`;
    option.disabled = true;
    option.className = 'text-gray-400';
  } else {
    const displayInfo = buildProductDisplayInfo(product);

    option.textContent = displayInfo.text;
    option.className = displayInfo.className;
  }

  return option;
}

function buildSaleText(product) {
  const saleLabels = [];

  if (product.onSale) saleLabels.push(' ⚡SALE');

  if (product.suggestSale) saleLabels.push(' 💝추천');

  return saleLabels.join('');
}

function buildProductDisplayInfo(product) {
  const { name, discountPrice, originalVal, onSale, suggestSale } = product;

  const saleText = buildSaleText(product);

  // 세일 조합별 표시 정보 매핑
  const saleDisplayMap = {
    both: {
      text: `⚡💝${name} - ${originalVal}원 → ${discountPrice}원 (25% SUPER SALE!)`,
      className: 'text-purple-600 font-bold',
    },
    lightning: {
      text: `⚡${name} - ${originalVal}원 → ${discountPrice}원 (20% SALE!)`,
      className: 'text-red-500 font-bold',
    },
    suggest: {
      text: `💝${name} - ${originalVal}원 → ${discountPrice}원 (5% 추천할인!)`,
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
