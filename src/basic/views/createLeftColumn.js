export function createProductSelectElement() {
  const productSelectElement = document.createElement('select');

  productSelectElement.id = 'product-select';
  productSelectElement.className = 'w-full p-3 border border-gray-300 rounded-lg text-base mb-3';

  return productSelectElement;
}

export function createAddToCartButton() {
  const addToCartButton = document.createElement('button');

  addToCartButton.id = 'add-to-cart';
  addToCartButton.innerHTML = 'Add to Cart';
  addToCartButton.className =
    'w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all';

  return addToCartButton;
}

export function createStockInfoDisplay() {
  const stockInfoDisplay = document.createElement('div');

  stockInfoDisplay.id = 'stock-status';
  stockInfoDisplay.className = 'text-xs text-red-500 mt-3 whitespace-pre-line';

  return stockInfoDisplay;
}
