const HEADER_CONTENT = {
  storeTitle: '🛒 Hanghae Online Store',
  pageTitle: 'Shopping Cart',
  initialItemCount: '🛍️ 0 items in cart',
};

const HEADER_CLASSES = 'mb-8';

function createShoppingCartHeaderHTML() {
  return /* HTML */ `
    <h1 class="text-xs font-medium tracking-extra-wide uppercase mb-2">${HEADER_CONTENT.storeTitle}</h1>
    <div class="text-5xl tracking-tight leading-none">${HEADER_CONTENT.pageTitle}</div>
    <p id="item-count" class="text-sm text-gray-500 font-normal mt-3">${HEADER_CONTENT.initialItemCount}</p>
  `;
}

export function createShoppingCartHeader() {
  const headerContainer = document.createElement('div');

  headerContainer.className = HEADER_CLASSES;
  headerContainer.innerHTML = createShoppingCartHeaderHTML();

  return headerContainer;
}
