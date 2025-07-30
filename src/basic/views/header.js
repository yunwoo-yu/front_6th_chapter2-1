function createShoppingCartHeaderHTML() {
  return /* HTML */ `
    <h1 class="text-xs font-medium tracking-extra-wide uppercase mb-2">🛒 Hanghae Online Store</h1>
    <div class="text-5xl tracking-tight leading-none">Shopping Cart</div>
    <p id="item-count" class="text-sm text-gray-500 font-normal mt-3">🛍️ 0 items in cart</p>
  `;
}

export function createHeader() {
  const headerContainer = document.createElement('div');

  headerContainer.className = 'mb-8';
  headerContainer.innerHTML = createShoppingCartHeaderHTML();

  return headerContainer;
}

export function updateItemCount(totalItemCount) {
  const itemCountElement = document.getElementById('item-count');

  if (itemCountElement) {
    itemCountElement.textContent = `🛍️ ${totalItemCount} items in cart`;
  }
}

export function resetHeader() {
  const itemCountElement = document.getElementById('item-count');

  if (itemCountElement) {
    itemCountElement.textContent = '🛍️ 0 items in cart';
  }
}
