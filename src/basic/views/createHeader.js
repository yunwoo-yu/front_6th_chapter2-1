const HEADER_CLASSES = {
  container: 'mb-8',
  title: 'text-xs font-medium tracking-extra-wide uppercase mb-2',
  subtitle: 'text-5xl tracking-tight leading-none',
  itemCount: 'text-sm text-gray-500 font-normal mt-3',
};

const HEADER_TEXT = {
  storeTitle: '🛒 Hanghae Online Store',
  pageTitle: 'Shopping Cart',
  initialItemCount: '🛍️ 0 items in cart',
};

// 헤더 요소 생성 함수들
function createHeaderContainer() {
  const headerContainer = document.createElement('div');
  headerContainer.className = HEADER_CLASSES.container;
  return headerContainer;
}

function createStoreTitleElement() {
  const storeTitleElement = document.createElement('h1');
  storeTitleElement.className = HEADER_CLASSES.title;
  storeTitleElement.textContent = HEADER_TEXT.storeTitle;
  return storeTitleElement;
}

function createPageTitleElement() {
  const pageTitleElement = document.createElement('div');
  pageTitleElement.className = HEADER_CLASSES.subtitle;
  pageTitleElement.textContent = HEADER_TEXT.pageTitle;
  return pageTitleElement;
}

function createItemCountElement() {
  const itemCountElement = document.createElement('p');
  itemCountElement.id = 'item-count';
  itemCountElement.className = HEADER_CLASSES.itemCount;
  itemCountElement.textContent = HEADER_TEXT.initialItemCount;
  return itemCountElement;
}

export function assembleShoppingCartHeader() {
  const headerContainer = createHeaderContainer();
  const storeTitleElement = createStoreTitleElement();
  const pageTitleElement = createPageTitleElement();
  const itemCountElement = createItemCountElement();

  headerContainer.appendChild(storeTitleElement);
  headerContainer.appendChild(pageTitleElement);
  headerContainer.appendChild(itemCountElement);

  return headerContainer;
}
