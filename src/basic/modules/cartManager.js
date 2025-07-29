import { UI_CONSTANTS } from '../utils';
import { findProductById } from './productManager.js';

let cartListElement = null;

export function initCartElements(cartElement) {
  cartListElement = cartElement;
}

export function addItemToCart(productId) {
  const product = findProductById(productId);
  if (!product || product.q <= 0) return false;

  const existingCartItem = document.getElementById(productId);

  if (existingCartItem) {
    return updateCartItemQuantity(existingCartItem, product, 1);
  } else {
    return createNewCartItem(product);
  }
}

export function removeItemFromCart(productId) {
  const cartItem = document.getElementById(productId);
  const product = findProductById(productId);

  if (!cartItem || !product) return false;

  const currentQty = parseInt(cartItem.querySelector('.quantity-number').textContent);
  product.q += currentQty;
  cartItem.remove();
  return true;
}

export function changeItemQuantity(productId, quantityChange) {
  const cartItem = document.getElementById(productId);
  const product = findProductById(productId);

  if (!cartItem || !product) return false;

  const qtyElement = cartItem.querySelector('.quantity-number');
  const currentQty = parseInt(qtyElement.textContent);
  const newQty = currentQty + quantityChange;

  if (newQty <= 0) {
    return removeItemFromCart(productId);
  }

  if (newQty <= product.q + currentQty) {
    qtyElement.textContent = newQty;
    product.q -= quantityChange;
    return true;
  }

  return false; // 재고 부족
}

export function getCartItems() {
  return Array.from(cartListElement.children);
}

export function updateCartItemPrices() {
  const cartItems = getCartItems();

  cartItems.forEach((cartItem) => {
    const product = findProductById(cartItem.id);
    if (!product) return;

    const priceDiv = cartItem.querySelector('.text-lg');
    const nameDiv = cartItem.querySelector('h3');

    const { name, priceHTML } = buildCartItemDisplay(product);
    nameDiv.textContent = name;
    priceDiv.innerHTML = priceHTML;
  });
}

function updateCartItemQuantity(cartItem, product, quantityChange) {
  const qtyElement = cartItem.querySelector('.quantity-number');
  const currentQty = parseInt(qtyElement.textContent);
  const newQty = currentQty + quantityChange;

  if (newQty <= product.q + currentQty) {
    qtyElement.textContent = newQty;
    product.q -= quantityChange;
    return true;
  }

  return false; // 재고 부족
}

function createNewCartItem(product) {
  const cartItem = document.createElement('div');
  cartItem.id = product.id;
  cartItem.className = UI_CONSTANTS.GRID_LAYOUT;
  cartItem.innerHTML = buildCartItemHTML(product);

  cartListElement.appendChild(cartItem);
  product.q--;
  return true;
}

function buildCartItemHTML(product) {
  const { priceHTML } = buildCartItemDisplay(product);
  const saleIcon = buildSaleIcon(product);

  return `
    <div class="${UI_CONSTANTS.PRODUCT_IMAGE_SIZE} bg-gradient-black relative overflow-hidden">
      <div class="absolute top-1/2 left-1/2 ${UI_CONSTANTS.PRODUCT_IMAGE_OVERLAY} ${UI_CONSTANTS.WHITE_OPACITY} -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
    </div>
    <div>
      <h3 class="text-base font-normal mb-1 tracking-tight">${saleIcon}${product.name}</h3>
      <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
      <p class="text-xs text-black mb-3">${priceHTML}</p>
      <div class="flex items-center gap-4">
        <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${product.id}" data-change="-1">−</button>
        <span class="quantity-number text-sm font-normal ${UI_CONSTANTS.QUANTITY_MIN_WIDTH} text-center tabular-nums">1</span>
        <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${product.id}" data-change="1">+</button>
      </div>
    </div>
    <div class="text-right">
      <div class="text-lg mb-2 tracking-tight tabular-nums">${priceHTML}</div>
      <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${product.id}">Remove</a>
    </div>
  `;
}

function buildCartItemDisplay(product) {
  const saleIcon = buildSaleIcon(product);

  if (!product.onSale && !product.suggestSale) {
    return {
      name: `${saleIcon}${product.name}`,
      priceHTML: `₩${product.discountPrice.toLocaleString()}`,
    };
  }

  const colorClass = getDiscountColorClass(product);
  return {
    name: `${saleIcon}${product.name}`,
    priceHTML: `<span class="line-through text-gray-400">₩${product.price.toLocaleString()}</span> <span class="${colorClass}">₩${product.discountPrice.toLocaleString()}</span>`,
  };
}

function buildSaleIcon(product) {
  if (product.onSale && product.suggestSale) return '⚡💝';
  if (product.onSale) return '⚡';
  if (product.suggestSale) return '💝';
  return '';
}

function getDiscountColorClass(product) {
  if (product.onSale && product.suggestSale) return 'text-purple-600';
  if (product.onSale) return UI_CONSTANTS.SALE_COLOR;
  if (product.suggestSale) return UI_CONSTANTS.SUGGEST_COLOR;
  return '';
}
